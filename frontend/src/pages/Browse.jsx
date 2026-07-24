import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "../lib/api";
import CarCard from "../components/CarCard";
import { MAKES, COUNTIES, FUEL_TYPES } from "../lib/data";

const selectCls = "w-full h-11 px-3 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors";

const Select = ({ label, value, onChange, options, testid }) => (
  <div>
    <label className="overline block mb-2 text-[#888]">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} className={selectCls}>
      <option value="">Any</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const empty = { q: "", make: "", fuelType: "", county: "", maxPrice: "", sort: "newest" };

export default function Browse() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState(empty);

  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
    api.get("/cars", { params }).then((r) => setCars(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [f]);

  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const active = Object.entries(f).filter(([k, v]) => v && k !== "sort").length;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-14" data-testid="browse-page">
      <p className="overline mb-3">Inventory</p>
      <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter font-light mb-10">Browse the collection</h1>

      <div className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6 mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal size={16} className="text-[#C5A880]" /> Filters</div>
          {active > 0 && (
            <button onClick={() => setF(empty)} data-testid="clear-filters" className="flex items-center gap-1 text-xs text-[#888] hover:text-[#F9F9F9] transition-colors">
              <X size={13} /> Clear ({active})
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="overline block mb-2 text-[#888]">Search</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
              <input value={f.q} onChange={(e) => set("q")(e.target.value)} placeholder="Make, model…" data-testid="search-input"
                className="w-full h-11 pl-9 pr-3 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]" />
            </div>
          </div>
          <Select label="Make" value={f.make} onChange={set("make")} options={MAKES} testid="filter-make" />
          <Select label="Fuel" value={f.fuelType} onChange={set("fuelType")} options={FUEL_TYPES} testid="filter-fuel" />
          <Select label="County" value={f.county} onChange={set("county")} options={COUNTIES} testid="filter-county" />
          <div>
            <label className="overline block mb-2 text-[#888]">Sort</label>
            <select value={f.sort} onChange={(e) => set("sort")(e.target.value)} data-testid="filter-sort" className={selectCls}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="mileage_asc">Lowest Mileage</option>
              <option value="year_desc">Newest Year</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#888] mb-6" data-testid="results-count">
        {loading ? "Loading…" : `${cars.length} vehicle${cars.length === 1 ? "" : "s"} available`}
      </p>

      {!loading && cars.length === 0 ? (
        <div className="text-center py-24 text-[#666] border border-[#2B2B2B] rounded-md">No cars match your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
        </div>
      )}
    </div>
  );
}
