from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import logging
import uuid
import io
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import bcrypt
import jwt
import requests
from PIL import Image
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from bson import ObjectId

# ---------------------------------------------------------------------------
# Config / DB
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "car-trading-ireland"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Car Trading Ireland API")
api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------------------------
# Object Storage helpers
# ---------------------------------------------------------------------------
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 403:
        # refresh key once
        globals()['storage_key'] = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 403:
        globals()['storage_key'] = None
        key = init_storage()
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}

# ---------------------------------------------------------------------------
# Mongo base model
# ---------------------------------------------------------------------------
PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    @classmethod
    def from_mongo(cls, doc: dict):
        if not doc:
            return None
        doc = dict(doc)
        if "_id" in doc:
            doc["id"] = str(doc.pop("_id"))
        return cls(**doc)


# ---------------------------------------------------------------------------
# Auth utils
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"]
TRANSMISSIONS = ["Manual", "Automatic"]


class LoginRequest(BaseModel):
    email: str
    password: str


class CarBase(BaseModel):
    title: str
    make: str
    model: str
    year: int
    price: float
    mileage: int
    fuelType: str = "Petrol"
    transmission: str = "Manual"
    engineSize: str = ""
    bodyType: str = ""
    colour: str = ""
    doors: int = 4
    county: str = ""
    description: str = ""
    features: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    featured: bool = False


class CarCreate(CarBase):
    pass


class Car(CarBase, BaseDocument):
    id: Optional[str] = None
    dateAdded: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(body: LoginRequest, response: Response):
    email = body.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")
    return {"id": str(user["_id"]), "email": email, "name": user.get("name", "Admin"), "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return {"id": admin["_id"], "email": admin["email"], "name": admin.get("name", "Admin")}


# ---------------------------------------------------------------------------
# Car routes (public read, admin write)
# ---------------------------------------------------------------------------
@api_router.get("/cars", response_model=List[Car])
async def list_cars(
    make: Optional[str] = None,
    fuelType: Optional[str] = None,
    county: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    featured: Optional[bool] = None,
    q: Optional[str] = None,
    sort: str = "newest",
):
    query: dict = {}
    if make:
        query["make"] = make
    if fuelType:
        query["fuelType"] = fuelType
    if county:
        query["county"] = county
    if featured is not None:
        query["featured"] = featured
    if minPrice is not None or maxPrice is not None:
        price_q = {}
        if minPrice is not None:
            price_q["$gte"] = minPrice
        if maxPrice is not None:
            price_q["$lte"] = maxPrice
        query["price"] = price_q
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"make": {"$regex": q, "$options": "i"}},
            {"model": {"$regex": q, "$options": "i"}},
        ]
    sort_map = {
        "newest": ("dateAdded", -1),
        "price_asc": ("price", 1),
        "price_desc": ("price", -1),
        "mileage_asc": ("mileage", 1),
        "year_desc": ("year", -1),
    }
    field, direction = sort_map.get(sort, ("dateAdded", -1))
    docs = await db.cars.find(query).sort(field, direction).to_list(1000)
    return [Car.from_mongo(d) for d in docs]


@api_router.get("/cars/{car_id}", response_model=Car)
async def get_car(car_id: str):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=404, detail="Car not found")
    doc = await db.cars.find_one({"_id": ObjectId(car_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Car not found")
    return Car.from_mongo(doc)


@api_router.post("/cars", response_model=Car)
async def create_car(body: CarCreate, admin: dict = Depends(get_current_admin)):
    doc = body.model_dump()
    doc["dateAdded"] = datetime.now(timezone.utc).isoformat()
    res = await db.cars.insert_one(doc)
    created = await db.cars.find_one({"_id": res.inserted_id})
    return Car.from_mongo(created)


@api_router.put("/cars/{car_id}", response_model=Car)
async def update_car(car_id: str, body: CarCreate, admin: dict = Depends(get_current_admin)):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=404, detail="Car not found")
    await db.cars.update_one({"_id": ObjectId(car_id)}, {"$set": body.model_dump()})
    doc = await db.cars.find_one({"_id": ObjectId(car_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Car not found")
    return Car.from_mongo(doc)


@api_router.delete("/cars/{car_id}")
async def delete_car(car_id: str, admin: dict = Depends(get_current_admin)):
    if not ObjectId.is_valid(car_id):
        raise HTTPException(status_code=404, detail="Car not found")
    await db.cars.delete_one({"_id": ObjectId(car_id)})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Image upload (admin) + public serving
# ---------------------------------------------------------------------------
def compress_image(data: bytes, ext: str) -> tuple[bytes, str]:
    try:
        img = Image.open(io.BytesIO(data))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        max_w = 1600
        if img.width > max_w:
            ratio = max_w / img.width
            img = img.resize((max_w, int(img.height * ratio)))
        out = io.BytesIO()
        img.save(out, format="JPEG", quality=82, optimize=True)
        return out.getvalue(), "image/jpeg"
    except Exception as e:
        logger.warning(f"compress failed: {e}")
        return data, MIME_TYPES.get(ext, "image/jpeg")


@api_router.post("/upload")
async def upload_images(files: List[UploadFile] = File(...), admin: dict = Depends(get_current_admin)):
    urls = []
    for file in files:
        ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg").lower()
        raw = await file.read()
        data, content_type = compress_image(raw, ext)
        path = f"{APP_NAME}/cars/{uuid.uuid4()}.jpg"
        result = put_object(path, data, content_type)
        stored_path = result["path"]
        await db.files.insert_one({
            "storage_path": stored_path,
            "original_filename": file.filename,
            "content_type": content_type,
            "size": result.get("size", len(data)),
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        urls.append(f"/api/files/{stored_path}")
    return {"urls": urls}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type),
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})


@api_router.get("/")
async def root():
    return {"message": "Car Trading Ireland API"}


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email, "password_hash": hash_password(admin_password),
            "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})

    await db.users.create_index("email", unique=True)
    await db.cars.create_index("price")
    await db.cars.create_index("make")
    await db.cars.create_index("model")
    await db.cars.create_index("county")
    await db.cars.create_index("dateAdded")

    if await db.cars.count_documents({}) == 0:
        await seed_cars()


async def seed_cars():
    samples = [
        {"title": "2019 BMW 3 Series 320d M Sport", "make": "BMW", "model": "3 Series", "year": 2019,
         "price": 28950, "mileage": 62000, "fuelType": "Diesel", "transmission": "Automatic",
         "engineSize": "2.0L", "bodyType": "Saloon", "colour": "Black", "doors": 4, "county": "Dublin",
         "description": "Full service history, NCT valid, immaculate condition throughout. One of the cleanest 320d M Sport examples available.",
         "features": ["Sat Nav", "Leather Seats", "Parking Sensors", "Cruise Control", "Bluetooth"],
         "images": ["https://images.unsplash.com/photo-1681167816895-940c56e0d2a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBzZWRhbiUyMGNhciUyMHBhcmtlZHxlbnwwfHx8fDE3ODQ5MDE4Mzl8MA&ixlib=rb-4.1.0&q=85", "https://images.unsplash.com/photo-1610099610040-ab19f3a5ec35?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBzZWRhbiUyMGNhciUyMHBhcmtlZHxlbnwwfHx8fDE3ODQ5MDE4Mzl8MA&ixlib=rb-4.1.0&q=85"], "featured": True},
        {"title": "2020 Tesla Model 3 Long Range", "make": "Tesla", "model": "Model 3", "year": 2020,
         "price": 33500, "mileage": 41000, "fuelType": "Electric", "transmission": "Automatic",
         "engineSize": "Electric", "bodyType": "Saloon", "colour": "White", "doors": 4, "county": "Cork",
         "description": "Long Range dual motor. Autopilot, premium interior, huge range. Charges anywhere.",
         "features": ["Autopilot", "Heated Seats", "Panoramic Roof", "Premium Audio"],
         "images": ["https://images.unsplash.com/photo-1783944361075-b8ad4eabe72f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxzdXYlMjBwYXJrZWQlMjBvdXRkb29yfGVufDB8fHx8MTc4NDkwMTgyMnww&ixlib=rb-4.1.0&q=85"], "featured": True},
        {"title": "2018 Volkswagen Golf 1.6 TDI", "make": "Volkswagen", "model": "Golf", "year": 2018,
         "price": 17450, "mileage": 88000, "fuelType": "Diesel", "transmission": "Manual",
         "engineSize": "1.6L", "bodyType": "Hatchback", "colour": "Grey", "doors": 5, "county": "Galway",
         "description": "Economical and reliable family hatchback. Ideal first car or commuter.",
         "features": ["Air Conditioning", "Bluetooth", "Alloy Wheels"],
         "images": ["https://images.unsplash.com/photo-1778943242936-7e93c588ad77?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxzdXYlMjBwYXJrZWQlMjBvdXRkb29yfGVufDB8fHx8MTc4NDkwMTgyMnww&ixlib=rb-4.1.0&q=85"], "featured": False},
        {"title": "2021 Toyota RAV4 Hybrid", "make": "Toyota", "model": "RAV4", "year": 2021,
         "price": 39900, "mileage": 33000, "fuelType": "Hybrid", "transmission": "Automatic",
         "engineSize": "2.5L", "bodyType": "SUV", "colour": "Silver", "doors": 5, "county": "Limerick",
         "description": "Self-charging hybrid SUV. Spacious, efficient and loaded with safety tech.",
         "features": ["Reversing Camera", "Lane Assist", "Apple CarPlay", "Heated Seats"],
         "images": ["https://images.unsplash.com/photo-1610099610040-ab19f3a5ec35?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBzZWRhbiUyMGNhciUyMHBhcmtlZHxlbnwwfHx8fDE3ODQ5MDE4Mzl8MA&ixlib=rb-4.1.0&q=85", "https://images.unsplash.com/photo-1783944361075-b8ad4eabe72f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxzdXYlMjBwYXJrZWQlMjBvdXRkb29yfGVufDB8fHx8MTc4NDkwMTgyMnww&ixlib=rb-4.1.0&q=85"], "featured": True},
    ]
    for s in samples:
        s["dateAdded"] = datetime.now(timezone.utc).isoformat()
    await db.cars.insert_many(samples)
    logger.info("Seeded sample cars")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
