import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Gauge, Fuel, Settings, MapPin, Calendar, Palette, DoorOpen, Phone, Mail, Check } from "lucide-react";
import { api, imageUrl, euro, km } from "../lib/api";
import { PLACEHOLDER } from "../lib/data";

const Spec = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-[#2B2B2B] last:border-0">
    <Icon size={17} className="text-[#666]" />
    <span className="text-sm text-[#888] flex-1">{label}</span>
    <span className="text-sm font-medium font-mono">{value || "—"}</span>
  </div>
);

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [active, setActive] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setActive(0);
    api.get(`/cars/${id}`).then((r) => setCar(r.data)).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return (
    <div className="max-w-3xl mx-auto px-5 py-32 text-center">
      <h2 className="font-heading text-2xl font-light mb-4">Car not found</h2>
      <Link to="/cars" className="text-[#C5A880] font-semibold">← Back to inventory</Link>
    </div>
  );
  if (!car) return <div className="min-h-[60vh] grid place-items-center text-[#666]">Loading…</div>;

  const images = car.images?.length ? car.images.map(imageUrl) : [PLACEHOLDER];

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-10" data-testid="car-detail-page">
      <button onClick={() => navigate(-1)} data-testid="back-btn"
        className="flex items-center gap-1.5 text-sm font-medium text-[#888] hover:text-[#F9F9F9] mb-7 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Gallery — bento: large main + thumb grid */}
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#2B2B2B]">
            <img src={images[active]} alt={car.title} data-testid="gallery-main"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3" data-testid="gallery-thumbs">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActive(i)} data-testid={`thumb-${i}`}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${active === i ? "border-[#C5A880]" : "border-transparent hover:border-white/20"}`}>
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                </button>
              ))}
            </div>
          )}

          {/* Description + features (desktop) */}
          <div className="hidden lg:block mt-12">
            <h2 className="font-heading text-xl font-medium mb-4 tracking-tight">Description</h2>
            <p className="text-[#aaa] leading-relaxed whitespace-pre-line">{car.description || "No description provided."}</p>
            {car.features?.length > 0 && (
              <>
                <h2 className="font-heading text-xl font-medium mt-10 mb-4 tracking-tight">Features & equipment</h2>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                  {car.features.map((ft) => (
                    <div key={ft} className="flex items-center gap-2.5 text-sm text-[#aaa]">
                      <Check size={16} className="text-[#C5A880] shrink-0" /> {ft}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sticky info */}
        <div className="lg:sticky lg:top-24 h-fit">
          {car.featured && <span className="text-[0.6rem] font-bold tracking-[0.15em] uppercase bg-[#C5A880] text-[#050505] px-2.5 py-1 rounded-sm">Featured</span>}
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-light mt-3 leading-tight">{car.title}</h1>
          <p className="font-mono font-semibold text-4xl text-[#C5A880] my-5">{euro(car.price)}</p>

          <div className="bg-[#121212] border border-[#2B2B2B] rounded-md p-5 mb-5">
            <Spec icon={Calendar} label="Year" value={car.year} />
            <Spec icon={Gauge} label="Mileage" value={km(car.mileage)} />
            <Spec icon={Fuel} label="Fuel" value={car.fuelType} />
            <Spec icon={Settings} label="Transmission" value={car.transmission} />
            <Spec icon={Palette} label="Colour" value={car.colour} />
            <Spec icon={DoorOpen} label="Doors" value={car.doors} />
            <Spec icon={MapPin} label="County" value={car.county} />
          </div>

          <a href="tel:+35312345678" data-testid="call-btn"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors mb-3">
            <Phone size={17} /> Call about this car
          </a>
          <a href="mailto:sales@hamoudecartrade.ie" data-testid="email-btn"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-sm border border-white/20 text-[#F9F9F9] font-semibold hover:bg-white/5 transition-colors">
            <Mail size={17} /> Email enquiry
          </a>
        </div>
      </div>

      {/* Description + features (mobile) */}
      <div className="lg:hidden mt-12">
        <h2 className="font-heading text-xl font-medium mb-4 tracking-tight">Description</h2>
        <p className="text-[#aaa] leading-relaxed whitespace-pre-line">{car.description || "No description provided."}</p>
        {car.features?.length > 0 && (
          <>
            <h2 className="font-heading text-xl font-medium mt-8 mb-4 tracking-tight">Features</h2>
            <div className="grid grid-cols-2 gap-y-2.5">
              {car.features.map((ft) => (
                <div key={ft} className="flex items-center gap-2 text-sm text-[#aaa]"><Check size={15} className="text-[#C5A880]" /> {ft}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
