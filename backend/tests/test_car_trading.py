"""Backend API tests for Car Trading Ireland."""
import os
import io
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://inventory-tracker-1361.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@hamoudecartrade.ie"
ADMIN_PASSWORD = "hamoude2024"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ------------ auth ------------
def test_login_wrong_password(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"}, timeout=30)
    assert r.status_code == 401


def test_auth_me(s, auth_headers):
    r = s.get(f"{API}/auth/me", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == ADMIN_EMAIL


def test_auth_me_unauthenticated(s):
    r = requests.get(f"{API}/auth/me", timeout=30)
    assert r.status_code == 401


# ------------ public list cars ------------
def test_list_cars_returns_seeded(s):
    r = s.get(f"{API}/cars", timeout=30)
    assert r.status_code == 200
    cars = r.json()
    assert isinstance(cars, list) and len(cars) >= 4
    for c in cars:
        assert "id" in c and "_id" not in c
        assert isinstance(c.get("images"), list)
        assert c["images"], f"empty images for {c.get('title')}"


def test_filter_fuel_electric(s):
    r = s.get(f"{API}/cars", params={"fuelType": "Electric"}, timeout=30)
    assert r.status_code == 200
    cars = r.json()
    assert len(cars) >= 1
    for c in cars:
        assert c["fuelType"] == "Electric"


def test_filter_make_bmw(s):
    r = s.get(f"{API}/cars", params={"make": "BMW"}, timeout=30)
    assert r.status_code == 200
    for c in r.json():
        assert c["make"] == "BMW"


def test_filter_price_range(s):
    r = s.get(f"{API}/cars", params={"minPrice": 20000, "maxPrice": 35000}, timeout=30)
    assert r.status_code == 200
    for c in r.json():
        assert 20000 <= c["price"] <= 35000


def test_search_q(s):
    r = s.get(f"{API}/cars", params={"q": "tesla"}, timeout=30)
    assert r.status_code == 200
    cars = r.json()
    assert len(cars) >= 1
    assert any("tesla" in c["title"].lower() or c["make"].lower() == "tesla" for c in cars)


def test_sort_price_asc(s):
    r = s.get(f"{API}/cars", params={"sort": "price_asc"}, timeout=30)
    prices = [c["price"] for c in r.json()]
    assert prices == sorted(prices)


def test_sort_price_desc(s):
    r = s.get(f"{API}/cars", params={"sort": "price_desc"}, timeout=30)
    prices = [c["price"] for c in r.json()]
    assert prices == sorted(prices, reverse=True)


def test_get_car_detail(s):
    r = s.get(f"{API}/cars", timeout=30)
    car_id = r.json()[0]["id"]
    r2 = s.get(f"{API}/cars/{car_id}", timeout=30)
    assert r2.status_code == 200
    assert r2.json()["id"] == car_id


def test_get_car_invalid_id(s):
    r = s.get(f"{API}/cars/notarealid", timeout=30)
    assert r.status_code == 404


# ------------ admin write protection ------------
def test_create_car_no_auth(s):
    payload = {"title": "x", "make": "x", "model": "x", "year": 2020, "price": 1, "mileage": 1}
    r = requests.post(f"{API}/cars", json=payload, timeout=30)
    assert r.status_code == 401


def test_upload_no_auth():
    r = requests.post(f"{API}/upload", files={"files": ("a.jpg", b"x", "image/jpeg")}, timeout=30)
    assert r.status_code == 401


def test_delete_car_no_auth():
    r = requests.delete(f"{API}/cars/507f1f77bcf86cd799439011", timeout=30)
    assert r.status_code == 401


# ------------ upload + serve (core bug) ------------
def _make_jpeg_bytes(color=(255, 0, 0)):
    img = Image.new("RGB", (200, 200), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture(scope="session")
def uploaded_urls(s, auth_headers):
    files = [
        ("files", ("a.jpg", _make_jpeg_bytes((255, 0, 0)), "image/jpeg")),
        ("files", ("b.jpg", _make_jpeg_bytes((0, 255, 0)), "image/jpeg")),
    ]
    r = s.post(f"{API}/upload", files=files, headers=auth_headers, timeout=120)
    assert r.status_code == 200, f"upload failed {r.status_code} {r.text}"
    urls = r.json()["urls"]
    assert isinstance(urls, list) and len(urls) == 2
    for u in urls:
        assert u.startswith("/api/files/")
    return urls


def test_public_image_serving_no_auth(uploaded_urls):
    for u in uploaded_urls:
        r = requests.get(f"{BASE_URL}{u}", timeout=60)
        assert r.status_code == 200, f"image not served: {u} -> {r.status_code}"
        assert r.headers.get("Content-Type", "").startswith("image/"), r.headers.get("Content-Type")
        assert len(r.content) > 100


# ------------ create/update/delete car ------------
def test_create_update_delete_car(s, auth_headers, uploaded_urls):
    payload = {
        "title": "TEST_2022 Ford Focus",
        "make": "Ford", "model": "Focus", "year": 2022,
        "price": 21999, "mileage": 15000,
        "fuelType": "Petrol", "transmission": "Manual",
        "engineSize": "1.0L", "bodyType": "Hatchback", "colour": "Blue",
        "doors": 5, "county": "Dublin", "description": "test",
        "features": ["Bluetooth"], "images": uploaded_urls, "featured": True,
    }
    r = s.post(f"{API}/cars", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200, r.text
    created = r.json()
    car_id = created["id"]
    assert created["images"] == uploaded_urls
    assert created["title"] == payload["title"]

    # verify in list
    r2 = s.get(f"{API}/cars/{car_id}", timeout=30)
    assert r2.status_code == 200
    assert r2.json()["images"] == uploaded_urls

    # image reachable publicly
    r3 = requests.get(f"{BASE_URL}{uploaded_urls[0]}", timeout=60)
    assert r3.status_code == 200

    # update
    payload["price"] = 19999
    payload["title"] = "TEST_2022 Ford Focus Updated"
    r4 = s.put(f"{API}/cars/{car_id}", json=payload, headers=auth_headers, timeout=30)
    assert r4.status_code == 200
    assert r4.json()["price"] == 19999

    r5 = s.get(f"{API}/cars/{car_id}", timeout=30)
    assert r5.json()["title"] == "TEST_2022 Ford Focus Updated"

    # delete
    r6 = s.delete(f"{API}/cars/{car_id}", headers=auth_headers, timeout=30)
    assert r6.status_code == 200

    r7 = s.get(f"{API}/cars/{car_id}", timeout=30)
    assert r7.status_code == 404



# ------------ submissions (public create, admin manage) ------------
@pytest.fixture(scope="session")
def submission_upload_urls(s):
    files = [
        ("files", ("s1.jpg", _make_jpeg_bytes((0, 0, 255)), "image/jpeg")),
    ]
    r = requests.post(f"{API}/submissions/upload", files=files, timeout=120)
    assert r.status_code == 200, f"public sub upload failed {r.status_code} {r.text}"
    urls = r.json()["urls"]
    assert len(urls) == 1 and urls[0].startswith("/api/files/")
    return urls


def test_public_submission_upload_no_auth(submission_upload_urls):
    # Publicly servable
    r = requests.get(f"{BASE_URL}{submission_upload_urls[0]}", timeout=60)
    assert r.status_code == 200
    assert r.headers.get("Content-Type", "").startswith("image/")


def test_create_submission_public(s, submission_upload_urls, auth_headers):
    payload = {
        "name": "TEST_John Doe", "phone": "0871234567", "email": "test_john@example.com",
        "make": "Audi", "model": "A4", "year": "2019", "mileage": "60000",
        "askingPrice": "18000", "county": "Dublin", "description": "Great car",
        "images": submission_upload_urls,
    }
    r = requests.post(f"{API}/submissions", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    sub = r.json()
    assert "id" in sub and "_id" not in sub
    assert sub["status"] == "pending"
    assert sub["images"] == submission_upload_urls
    sid = sub["id"]

    # list requires auth
    r_noauth = requests.get(f"{API}/submissions", timeout=30)
    assert r_noauth.status_code == 401

    # list with auth includes it
    r_list = s.get(f"{API}/submissions", headers=auth_headers, timeout=30)
    assert r_list.status_code == 200
    ids = [x["id"] for x in r_list.json()]
    assert sid in ids

    # filter pending
    r_pending = s.get(f"{API}/submissions", params={"status": "pending"}, headers=auth_headers, timeout=30)
    assert r_pending.status_code == 200
    assert all(x["status"] == "pending" for x in r_pending.json())

    # status update requires auth
    r_noauth2 = requests.patch(f"{API}/submissions/{sid}/status", params={"status": "reviewed"}, timeout=30)
    assert r_noauth2.status_code == 401

    # mark reviewed
    r_upd = s.patch(f"{API}/submissions/{sid}/status", params={"status": "reviewed"}, headers=auth_headers, timeout=30)
    assert r_upd.status_code == 200
    assert r_upd.json()["status"] == "reviewed"

    # mark accepted
    r_upd2 = s.patch(f"{API}/submissions/{sid}/status", params={"status": "accepted"}, headers=auth_headers, timeout=30)
    assert r_upd2.json()["status"] == "accepted"

    # delete requires auth
    r_del_noauth = requests.delete(f"{API}/submissions/{sid}", timeout=30)
    assert r_del_noauth.status_code == 401

    r_del = s.delete(f"{API}/submissions/{sid}", headers=auth_headers, timeout=30)
    assert r_del.status_code == 200


def test_submissions_upload_too_many():
    files = [("files", (f"{i}.jpg", _make_jpeg_bytes((i * 10 % 255, 0, 0)), "image/jpeg")) for i in range(13)]
    r = requests.post(f"{API}/submissions/upload", files=files, timeout=120)
    assert r.status_code == 400


# ------------ contact (public create, admin manage) ------------
def test_create_contact_public(s, auth_headers):
    payload = {
        "name": "TEST_Jane", "email": "test_jane@example.com", "phone": "0899999999",
        "subject": "Question", "message": "Hello, I am interested in a listing.",
    }
    r = requests.post(f"{API}/contact", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    msg = r.json()
    assert "id" in msg and "_id" not in msg
    assert msg["status"] == "unread"
    cid = msg["id"]

    # list requires auth
    r_noauth = requests.get(f"{API}/contact", timeout=30)
    assert r_noauth.status_code == 401

    r_list = s.get(f"{API}/contact", headers=auth_headers, timeout=30)
    assert r_list.status_code == 200
    assert cid in [x["id"] for x in r_list.json()]

    # mark read
    r_noauth2 = requests.patch(f"{API}/contact/{cid}/status", params={"status": "read"}, timeout=30)
    assert r_noauth2.status_code == 401

    r_upd = s.patch(f"{API}/contact/{cid}/status", params={"status": "read"}, headers=auth_headers, timeout=30)
    assert r_upd.status_code == 200
    assert r_upd.json()["status"] == "read"

    # delete requires auth
    r_del_noauth = requests.delete(f"{API}/contact/{cid}", timeout=30)
    assert r_del_noauth.status_code == 401
    r_del = s.delete(f"{API}/contact/{cid}", headers=auth_headers, timeout=30)
    assert r_del.status_code == 200


# ------------ admin stats ------------
def test_admin_stats_requires_auth():
    r = requests.get(f"{API}/admin/stats", timeout=30)
    assert r.status_code == 401


def test_admin_stats_shape(s, auth_headers):
    r = s.get(f"{API}/admin/stats", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    data = r.json()
    for key in ["totalListings", "inventoryValue", "pendingSubmissions", "unreadMessages"]:
        assert key in data, f"missing key {key}"
    assert isinstance(data["totalListings"], int)
    assert data["totalListings"] >= 0
    assert isinstance(data["inventoryValue"], (int, float))
    assert isinstance(data["pendingSubmissions"], int)
    assert isinstance(data["unreadMessages"], int)
