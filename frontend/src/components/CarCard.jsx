import { Link } from "react-router-dom";
import { Gauge, Fuel, Settings, MapPin } from "lucide-react";
import { imageUrl, euro, km } from "../lib/api";
import { PLACEHOLDER } from "../lib/data";

export default function CarCard({ car, index = 0 }) {
  const cover = car.images?.[0] ? imageUrl(car.images[0]) : PLACEHOLDER;
  return (
    <Link
      to={`/cars/${car.id}`}
      data-testid={`car-card-${car.id}`}
      className="card-hover block bg-white border border-zinc-200 rounded-xl overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
        <img src={cover} alt={car.title} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
        {car.featured && (
          <span className="absolute top-3 left-3 text-[0.65rem] font-bold tracking-wide uppercase bg-[#10B981] text-white px-2.5 py-1 rounded-md">
            Featured
          </span>
        )}
        {car.images?.length > 1 && (
          <span className="absolute bottom-3 right-3 text-xs font-medium bg-black/70 text-white px-2 py-1 rounded-md">
            {car.images.length} photos
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading font-semibold text-base leading-snug tracking-tight line-clamp-2">{car.title}</h3>
        </div>
        <p className="font-heading font-bold text-2xl text-[#10B981] mt-2 mb-4">{euro(car.price)}</p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><Gauge size={14} /> {km(car.mileage)}</span>
          <span className="flex items-center gap-1.5"><Fuel size={14} /> {car.fuelType}</span>
          <span className="flex items-center gap-1.5"><Settings size={14} /> {car.transmission}</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} /> {car.county || "—"}</span>
        </div>
      </div>
    </Link>
  );
}
