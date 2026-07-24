import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Gauge, Fuel, Settings, MapPin, Calendar, Palette, DoorOpen, Phone, Mail, Check } from "lucide-react";
import { api, imageUrl, euro, km } from "../lib/api";
import { PLACEHOLDER } from "../lib/data";

const Spec = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-zinc-100">
    <Icon size={18} className="text-zinc-400" />
    <span className="text-sm text-zinc-500 flex-1">{label}</span>
    <span className="text-sm font-semibold">{value || "—"}</span>
  </div>
);

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [active, setActive] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/cars/${id}`).then((r) => setCar(r.data)).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return (
    <div className="max-w-3xl mx-auto px-5 py-32 text-center">
      <h2 className="font-heading text-2xl font-semibold mb-4">Car not found</h2>
      <Link to="/cars" className="text-[#10B981] font-semibold">← Back to inventory</Link>
    </div>
  );
  if (!car) return <div className="min-h-[60vh] grid place-items-center text-zinc-400">Loading…</div>;

  const images = car.images?.length ? car.images.map(imageUrl) : [PLACEHOLDER];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10" data-testid="car-detail-page">
      <button onClick={() => navigate(-1)} data-testid="back-btn"
        className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-[#0A0A0A] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Gallery */}
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <img src={images[active]} alt={car.title} data-testid="gallery-main"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3" data-testid="gallery-thumbs">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActive(i)} data-testid={`thumb-${i}`}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${active === i ? "border-[#10B981]" : "border-transparent hover:border-zinc-300"}`}>
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky info */}
        <div className="lg:sticky lg:top-24 h-fit">
          {car.featured && <span className="text-[0.65rem] font-bold tracking-wide uppercase bg-[#10B981] text-white px-2.5 py-1 rounded-md">Featured</span>}
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-semibold mt-3 leading-tight">{car.title}</h1>
          <p className="font-heading font-bold text-4xl text-[#10B981] my-4">{euro(car.price)}</p>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-5">
            <Spec icon={Calendar} label="Year" value={car.year} />
            <Spec icon={Gauge} label="Mileage" value={km(car.mileage)} />
            <Spec icon={Fuel} label="Fuel" value={car.fuelType} />
            <Spec icon={Settings} label="Transmission" value={car.transmission} />
            <Spec icon={Palette} label="Colour" value={car.colour} />
            <Spec icon={DoorOpen} label="Doors" value={car.doors} />
            <Spec icon={MapPin} label="County" value={car.county} />
          </div>

          <a href="tel:+35312345678" data-testid="call-btn"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-[#0A0A0A] text-white font-semibold hover:bg-zinc-800 transition-colors mb-3">
            <Phone size={17} /> Call about this car
          </a>
          <a href="mailto:sales@hamoudecartrade.ie" data-testid="email-btn"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg border border-zinc-300 font-semibold hover:bg-zinc-50 transition-colors">
            <Mail size={17} /> Email enquiry
          </a>
        </div>
      </div>

      {/* Description + features */}
      <div className="grid lg:grid-cols-3 gap-10 mt-14">
        <div className="lg:col-span-2">
          <h2 className="font-heading text-xl font-semibold mb-4 tracking-tight">Description</h2>
          <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{car.description || "No description provided."}</p>
        </div>
        {car.features?.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-semibold mb-4 tracking-tight">Features</h2>
            <ul className="space-y-2">
              {car.features.map((ft) => (
                <li key={ft} className="flex items-center gap-2 text-sm text-zinc-600">
                  <Check size={16} className="text-[#10B981]" /> {ft}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
