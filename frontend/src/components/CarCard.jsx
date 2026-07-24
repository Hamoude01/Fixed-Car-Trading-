import { Link } from "react-router-dom";
import { Gauge, Fuel, Settings, MapPin, ArrowUpRight } from "lucide-react";
import { imageUrl, euro, km } from "../lib/api";
import { PLACEHOLDER } from "../lib/data";

export default function CarCard({ car, index = 0 }) {
  const cover = car.images?.[0] ? imageUrl(car.images[0]) : PLACEHOLDER;
  return (
    <Link
      to={`/cars/${car.id}`}
      data-testid={`car-card-${car.id}`}
      className="card-hover group block bg-[#121212] border border-[#2B2B2B] rounded-md overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[16/11] bg-[#1A1A1A] overflow-hidden">
        <img src={cover} alt={car.title} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {car.featured && (
          <span className="absolute top-3.5 left-3.5 text-[0.6rem] font-bold tracking-[0.15em] uppercase bg-[#C5A880] text-[#050505] px-2.5 py-1 rounded-sm">
            Featured
          </span>
        )}
        {car.images?.length > 1 && (
          <span className="absolute bottom-3.5 right-3.5 text-xs font-medium bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-sm border border-white/10">
            {car.images.length} photos
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading font-medium text-base leading-snug tracking-tight line-clamp-2">{car.title}</h3>
          <ArrowUpRight size={18} className="text-[#555] group-hover:text-[#C5A880] transition-colors shrink-0 mt-0.5" />
        </div>
        <p className="font-mono font-semibold text-xl text-[#C5A880] mt-2.5 mb-4">{euro(car.price)}</p>
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs text-[#888] border-t border-[#2B2B2B] pt-4">
          <span className="flex items-center gap-1.5"><Gauge size={14} className="text-[#666]" /> {km(car.mileage)}</span>
          <span className="flex items-center gap-1.5"><Fuel size={14} className="text-[#666]" /> {car.fuelType}</span>
          <span className="flex items-center gap-1.5"><Settings size={14} className="text-[#666]" /> {car.transmission}</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#666]" /> {car.county || "—"}</span>
        </div>
      </div>
    </Link>
  );
}
