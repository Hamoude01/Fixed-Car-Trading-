import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "../lib/api";
import CarCard from "../components/CarCard";
import { MAKES, COUNTIES, FUEL_TYPES } from "../lib/data";

const Select = ({ label, value, onChange, options, testid }) => (
  <div>
    <label className="overline block mb-1.5">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid}
      className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]">
      <option value="">Any</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default function Browse() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ q: "", make: "", fuelType: "", county: "", maxPrice: "", sort: "newest" });

  const load = () => {
    setLoading(true);
    const params = {};
    Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
    api.get("/cars", { params }).then((r) => setCars(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [f]);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12" data-testid="browse-page">
      <p className="overline mb-2">Inventory</p>
      <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter font-semibold mb-8">Browse cars</h1>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-10">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold"><SlidersHorizontal size={16} /> Filters</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="overline block mb-1.5">Search</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input value={f.q} onChange={(e) => set("q")(e.target.value)} placeholder="Make, model…" data-testid="search-input"
                className="w-full h-10 pl-9 pr-3 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />
            </div>
          </div>
          <Select label="Make" value={f.make} onChange={set("make")} options={MAKES} testid="filter-make" />
          <Select label="Fuel" value={f.fuelType} onChange={set("fuelType")} options={FUEL_TYPES} testid="filter-fuel" />
          <Select label="County" value={f.county} onChange={set("county")} options={COUNTIES} testid="filter-county" />
          <div>
            <label className="overline block mb-1.5">Sort</label>
            <select value={f.sort} onChange={(e) => set("sort")(e.target.value)} data-testid="filter-sort"
              className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="mileage_asc">Lowest Mileage</option>
              <option value="year_desc">Newest Year</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-500 mb-6" data-testid="results-count">
        {loading ? "Loading…" : `${cars.length} car${cars.length === 1 ? "" : "s"} found`}
      </p>

      {!loading && cars.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">No cars match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
        </div>
      )}
    </div>
  );
}
