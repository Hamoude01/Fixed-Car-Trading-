import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import PhotoUploader from "../../components/PhotoUploader";
import { MAKES, COUNTIES, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from "../../lib/data";

const empty = {
  title: "", make: "", model: "", year: new Date().getFullYear(), price: "", mileage: "",
  fuelType: "Petrol", transmission: "Manual", engineSize: "", bodyType: "", colour: "",
  doors: 4, county: "", description: "", features: [], images: [], featured: false, status: "available",
};

const inputCls = "w-full h-10 px-3 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors";

const Field = ({ label, children }) => (
  <div>
    <label className="overline block mb-2 text-[#888]">{label}</label>
    {children}
  </div>
);

export default function CarForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) api.get(`/cars/${id}`).then((r) => setForm({ ...empty, ...r.data })).catch(() => toast.error("Failed to load car"));
  }, [id, editing]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addFeature = () => {
    const v = featureInput.trim();
    if (v && !form.features.includes(v)) set("features", [...form.features, v]);
    setFeatureInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.make) { toast.error("Title and make are required"); return; }
    setSaving(true);
    const payload = { ...form, year: Number(form.year) || 0, price: Number(form.price) || 0, mileage: Number(form.mileage) || 0, doors: Number(form.doors) || 4 };
    try {
      if (editing) await api.put(`/cars/${id}`, payload);
      else await api.post("/cars", payload);
      toast.success(editing ? "Listing updated" : "Listing created");
      navigate("/admin/listings");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const textFields = [
    ["Title", "title", "text", "2019 BMW 3 Series 320d M Sport", "sm:col-span-2"],
    ["Model", "model", "text", "", ""],
    ["Year", "year", "number", "", ""],
    ["Price (€)", "price", "number", "", ""],
    ["Mileage (km)", "mileage", "number", "", ""],
    ["Engine size", "engineSize", "text", "2.0L", ""],
    ["Colour", "colour", "text", "", ""],
    ["Doors", "doors", "number", "", ""],
  ];

  return (
    <div data-testid="car-form-page">
      <Link to="/admin/listings" className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#F9F9F9] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to listings
      </Link>
      <h1 className="font-heading text-3xl font-light tracking-tight mb-8">{editing ? "Edit listing" : "New listing"}</h1>

      <form onSubmit={submit} className="space-y-6 max-w-4xl">
        <section className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6">
          <h2 className="font-heading font-medium mb-1">Photos</h2>
          <p className="text-sm text-[#888] mb-4">Upload multiple photos. Drag to reorder. First photo is the cover.</p>
          <PhotoUploader images={form.images} onChange={(imgs) => set("images", imgs)} endpoint="/upload" />
        </section>

        <section className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6 space-y-5">
          <h2 className="font-heading font-medium">Details</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {textFields.map(([label, key, type, ph, span]) => (
              <div key={key} className={span}>
                <Field label={label}>
                  <input type={type} className={inputCls} value={form[key]} onChange={(e) => set(key, e.target.value)} data-testid={`car-${key}`} placeholder={ph} />
                </Field>
              </div>
            ))}
            <Field label="Make">
              <select className={inputCls} value={form.make} onChange={(e) => set("make", e.target.value)} data-testid="car-make">
                <option value="">Select make</option>
                {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="County">
              <select className={inputCls} value={form.county} onChange={(e) => set("county", e.target.value)} data-testid="car-county">
                <option value="">Select county</option>
                {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Fuel type">
              <select className={inputCls} value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)} data-testid="car-fuel">
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Transmission">
              <select className={inputCls} value={form.transmission} onChange={(e) => set("transmission", e.target.value)} data-testid="car-transmission">
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Body type">
              <select className={inputCls} value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)} data-testid="car-body">
                <option value="">Select</option>
                {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)} data-testid="car-status">
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={4} className="w-full px-3 py-2.5 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]"
              value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="car-description" />
          </Field>

          <Field label="Features">
            <div className="flex gap-2">
              <input className={inputCls} value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                data-testid="car-feature-input" placeholder="e.g. Sat Nav, then Enter" />
              <button type="button" onClick={addFeature} className="px-4 rounded-sm bg-[#1A1A1A] text-[#C5A880] text-sm font-medium hover:bg-[#222] transition-colors">Add</button>
            </div>
            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.features.map((ft) => (
                  <span key={ft} className="flex items-center gap-1.5 text-xs bg-[#1A1A1A] px-2.5 py-1 rounded-sm text-[#ccc]">
                    {ft}
                    <button type="button" onClick={() => set("features", form.features.filter((x) => x !== ft))} className="text-[#666] hover:text-[#FF3B30]">×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} data-testid="car-featured" className="w-4 h-4 accent-[#C5A880]" />
            <span className="text-sm font-medium">Feature this car on the homepage</span>
          </label>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} data-testid="save-car-btn"
            className="px-7 py-3 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save changes" : "Create listing"}
          </button>
          <Link to="/admin/listings" className="px-7 py-3 rounded-sm border border-white/20 font-semibold hover:bg-white/5 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
