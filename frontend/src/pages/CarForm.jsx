import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, UploadCloud, X, GripVertical, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, imageUrl } from "../lib/api";
import { MAKES, COUNTIES, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, PLACEHOLDER } from "../lib/data";

const empty = {
  title: "", make: "", model: "", year: new Date().getFullYear(), price: "", mileage: "",
  fuelType: "Petrol", transmission: "Manual", engineSize: "", bodyType: "", colour: "",
  doors: 4, county: "", description: "", features: [], images: [], featured: false,
};

const Field = ({ label, children }) => (
  <div>
    <label className="overline block mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full h-10 px-3 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]";

export default function CarForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState(empty);
  const [featureInput, setFeatureInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef(null);

  useEffect(() => {
    if (editing) {
      api.get(`/cars/${id}`).then((r) => setForm({ ...empty, ...r.data })).catch(() => toast.error("Failed to load car"));
    }
  }, [id, editing]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onFiles = async (files) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("images", [...form.images, ...data.urls]);
      toast.success(`${data.urls.length} photo${data.urls.length === 1 ? "" : "s"} uploaded`);
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (i) => set("images", form.images.filter((_, idx) => idx !== i));
  const makeCover = (i) => {
    const imgs = [...form.images];
    const [moved] = imgs.splice(i, 1);
    imgs.unshift(moved);
    set("images", imgs);
  };
  const onDrop = (i) => {
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const imgs = [...form.images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(i, 0, moved);
    set("images", imgs);
    dragIndex.current = null;
  };

  const addFeature = () => {
    const v = featureInput.trim();
    if (v && !form.features.includes(v)) set("features", [...form.features, v]);
    setFeatureInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.make) { toast.error("Title and make are required"); return; }
    setSaving(true);
    const payload = {
      ...form,
      year: Number(form.year), price: Number(form.price), mileage: Number(form.mileage), doors: Number(form.doors),
    };
    try {
      if (editing) await api.put(`/cars/${id}`, payload);
      else await api.post("/cars", payload);
      toast.success(editing ? "Listing updated" : "Listing created");
      navigate("/admin");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="car-form-page">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <Link to="/admin" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#0A0A0A] mb-6">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight mb-8">{editing ? "Edit listing" : "New listing"}</h1>

        <form onSubmit={submit} className="space-y-8">
          {/* Photos */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6">
            <h2 className="font-heading font-semibold mb-1">Photos</h2>
            <p className="text-sm text-zinc-500 mb-4">Upload multiple photos. Drag to reorder. First photo is the cover.</p>

            <div onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
              data-testid="upload-dropzone"
              className="cursor-pointer border-2 border-dashed border-zinc-300 rounded-xl py-10 grid place-items-center text-center hover:border-[#10B981] hover:bg-emerald-50/30 transition-colors">
              {uploading ? <Loader2 className="animate-spin text-[#10B981]" /> : <UploadCloud className="text-zinc-400 mb-2" size={28} />}
              <p className="text-sm font-medium">{uploading ? "Uploading…" : "Click or drag photos here"}</p>
              <p className="text-xs text-zinc-400 mt-1">JPG, PNG, WebP — multiple allowed</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden data-testid="file-input"
              onChange={(e) => onFiles(e.target.files)} />

            {form.images.length > 0 && (
              <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 gap-3" data-testid="image-grid">
                {form.images.map((img, i) => (
                  <div key={img + i} draggable
                    onDragStart={() => (dragIndex.current = i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(i)}
                    data-testid={`image-thumb-${i}`}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                    <img src={imageUrl(img)} alt="" className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 text-[0.6rem] font-bold uppercase bg-[#10B981] text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Star size={9} /> Cover
                      </span>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 text-white/80"><GripVertical size={14} /></span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {i !== 0 && (
                        <button type="button" onClick={() => makeCover(i)} data-testid={`set-cover-${i}`}
                          className="text-xs bg-white text-black px-2 py-1 rounded font-medium">Set cover</button>
                      )}
                      <button type="button" onClick={() => removeImage(i)} data-testid={`remove-image-${i}`}
                        className="p-1.5 bg-red-500 text-white rounded" aria-label="Remove"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Details */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-5">
            <h2 className="font-heading font-semibold">Details</h2>
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="input-title" placeholder="2019 BMW 3 Series 320d M Sport" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Make">
                <select className={inputCls} value={form.make} onChange={(e) => set("make", e.target.value)} data-testid="input-make">
                  <option value="">Select make</option>
                  {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Model"><input className={inputCls} value={form.model} onChange={(e) => set("model", e.target.value)} data-testid="input-model" /></Field>
              <Field label="Year"><input type="number" className={inputCls} value={form.year} onChange={(e) => set("year", e.target.value)} data-testid="input-year" /></Field>
              <Field label="Price (€)"><input type="number" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} data-testid="input-price" /></Field>
              <Field label="Mileage (km)"><input type="number" className={inputCls} value={form.mileage} onChange={(e) => set("mileage", e.target.value)} data-testid="input-mileage" /></Field>
              <Field label="County">
                <select className={inputCls} value={form.county} onChange={(e) => set("county", e.target.value)} data-testid="input-county">
                  <option value="">Select county</option>
                  {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Fuel type">
                <select className={inputCls} value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)} data-testid="input-fuel">
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Transmission">
                <select className={inputCls} value={form.transmission} onChange={(e) => set("transmission", e.target.value)} data-testid="input-transmission">
                  {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Body type">
                <select className={inputCls} value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)} data-testid="input-body">
                  <option value="">Select</option>
                  {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Engine size"><input className={inputCls} value={form.engineSize} onChange={(e) => set("engineSize", e.target.value)} data-testid="input-engine" placeholder="2.0L" /></Field>
              <Field label="Colour"><input className={inputCls} value={form.colour} onChange={(e) => set("colour", e.target.value)} data-testid="input-colour" /></Field>
              <Field label="Doors"><input type="number" className={inputCls} value={form.doors} onChange={(e) => set("doors", e.target.value)} data-testid="input-doors" /></Field>
            </div>
            <Field label="Description">
              <textarea rows={4} className="w-full px-3 py-2 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
                value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="input-description" />
            </Field>

            <Field label="Features">
              <div className="flex gap-2">
                <input className={inputCls} value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                  data-testid="input-feature" placeholder="e.g. Sat Nav, then Enter" />
                <button type="button" onClick={addFeature} className="px-4 rounded-md bg-[#0A0A0A] text-white text-sm font-medium">Add</button>
              </div>
              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.features.map((ft) => (
                    <span key={ft} className="flex items-center gap-1.5 text-xs bg-[#F3F4F6] px-2.5 py-1 rounded-md">
                      {ft}
                      <button type="button" onClick={() => set("features", form.features.filter((x) => x !== ft))}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} data-testid="input-featured" className="w-4 h-4 accent-[#10B981]" />
              <span className="text-sm font-medium">Feature this car on the homepage</span>
            </label>
          </section>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} data-testid="save-car-btn"
              className="px-7 py-3 rounded-lg bg-[#10B981] text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save changes" : "Create listing"}
            </button>
            <Link to="/admin" className="px-7 py-3 rounded-lg border border-zinc-300 font-semibold hover:bg-zinc-50 transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
