import { useState } from "react";
import { CheckCircle2, ArrowRight, Camera, Banknote, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import PhotoUploader from "../components/PhotoUploader";
import { MAKES, COUNTIES } from "../lib/data";

const inputCls = "w-full h-11 px-3 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors";

const empty = { name: "", phone: "", email: "", make: "", model: "", year: "", mileage: "", askingPrice: "", county: "", description: "", images: [] };

const Field = ({ label, required, children }) => (
  <div>
    <label className="overline block mb-2 text-[#888]">{label}{required && <span className="text-[#C5A880]"> *</span>}</label>
    {children}
  </div>
);

export default function SellYourCar() {
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.make || !form.model) {
      toast.error("Please fill in your contact details and car make/model");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/submissions", form);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="max-w-2xl mx-auto px-5 py-32 text-center" data-testid="sell-success">
      <CheckCircle2 size={56} className="text-[#34C759] mx-auto mb-6" />
      <h1 className="font-heading text-3xl font-light tracking-tight">Submission received</h1>
      <p className="text-[#888] mt-4 leading-relaxed">Thank you, {form.name.split(" ")[0]}. Our team will review your {form.make} {form.model} and get back to you within 24 hours with a valuation.</p>
      <button onClick={() => { setForm(empty); setDone(false); }} className="mt-8 px-7 py-3 rounded-sm border border-white/20 font-semibold hover:bg-white/5 transition-colors">
        Submit another car
      </button>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-14" data-testid="sell-page">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Intro */}
        <div className="lg:sticky lg:top-24 h-fit">
          <p className="overline mb-3">Sell your car</p>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-tighter font-light leading-[1.05]">Turn your car into <span className="text-[#C5A880]">cash.</span></h1>
          <p className="text-[#888] mt-5 leading-relaxed">Fill in the details, add a few photos, and we'll take it from there. No pressure, no obligation.</p>
          <div className="mt-10 space-y-5">
            {[
              { icon: Camera, t: "Add your photos", d: "Upload up to 12 images of your car" },
              { icon: Clock, t: "Fast review", d: "We respond within 24 hours" },
              { icon: Banknote, t: "Fair valuation", d: "Transparent, market-based offer" },
            ].map((s) => (
              <div key={s.t} className="flex items-start gap-4">
                <span className="grid place-items-center w-10 h-10 rounded-sm bg-[#1A1A1A] text-[#C5A880] shrink-0"><s.icon size={18} /></span>
                <div>
                  <p className="font-medium">{s.t}</p>
                  <p className="text-sm text-[#888]">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-2 space-y-8" data-testid="sell-form">
          <section className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6">
            <h2 className="font-heading font-medium mb-1">Your photos</h2>
            <p className="text-sm text-[#888] mb-4">Add clear photos — exterior, interior and any details. The first photo is the cover.</p>
            <PhotoUploader images={form.images} onChange={(imgs) => set("images", imgs)} endpoint="/submissions/upload" max={12} />
          </section>

          <section className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6 space-y-5">
            <h2 className="font-heading font-medium">Contact details</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Full name" required><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="sell-name" /></Field>
              <Field label="Phone" required><input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="sell-phone" /></Field>
              <Field label="Email" required><input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="sell-email" /></Field>
            </div>
          </section>

          <section className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6 space-y-5">
            <h2 className="font-heading font-medium">Car details</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Make" required>
                <select className={inputCls} value={form.make} onChange={(e) => set("make", e.target.value)} data-testid="sell-make">
                  <option value="">Select make</option>
                  {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Model" required><input className={inputCls} value={form.model} onChange={(e) => set("model", e.target.value)} data-testid="sell-model" /></Field>
              <Field label="Year"><input className={inputCls} value={form.year} onChange={(e) => set("year", e.target.value)} data-testid="sell-year" placeholder="2019" /></Field>
              <Field label="Mileage (km)"><input className={inputCls} value={form.mileage} onChange={(e) => set("mileage", e.target.value)} data-testid="sell-mileage" /></Field>
              <Field label="Asking price (€)"><input className={inputCls} value={form.askingPrice} onChange={(e) => set("askingPrice", e.target.value)} data-testid="sell-price" /></Field>
              <Field label="County">
                <select className={inputCls} value={form.county} onChange={(e) => set("county", e.target.value)} data-testid="sell-county">
                  <option value="">Select county</option>
                  {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Anything else we should know?">
              <textarea rows={4} className="w-full px-3 py-2.5 rounded-sm border border-[#2B2B2B] bg-[#121212] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880]"
                value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="sell-description" placeholder="Service history, condition, reason for selling…" />
            </Field>
          </section>

          <button type="submit" disabled={submitting} data-testid="sell-submit"
            className="flex items-center gap-2 px-8 py-4 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit for valuation"} <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
