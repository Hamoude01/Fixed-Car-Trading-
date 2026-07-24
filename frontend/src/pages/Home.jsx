import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Search, BadgeCheck, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import CarCard from "../components/CarCard";
import BrandRibbon from "../components/BrandRibbon";

const HERO = "https://images.unsplash.com/photo-1756990683708-afd38ed20f1f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBzcG9ydHMlMjBjYXIlMjBzdHVkaW8lMjBsaWdodGluZ3xlbnwwfHx8fDE3ODQ5MzYxMzR8MA&ixlib=rb-4.1.0&q=85";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/cars", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative min-h-[86vh] flex items-center overflow-hidden">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-[#050505]/30" />
        <div className="relative max-w-[1400px] w-full mx-auto px-5 sm:px-10 py-24">
          <p className="overline mb-6 animate-fade-up flex items-center gap-2"><Sparkles size={14} /> Car Trading Ireland</p>
          <h1 className="font-heading text-5xl sm:text-7xl tracking-tighter font-light max-w-3xl leading-[1.02] animate-fade-up" style={{ animationDelay: "80ms" }}>
            Exceptional cars,<br /><span className="font-semibold text-[#C5A880]">honestly delivered.</span>
          </h1>
          <p className="mt-7 text-lg text-[#bbb] max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: "160ms" }}>
            A curated collection of premium used vehicles from across Ireland — each one inspected, verified and ready to drive away.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
            <button data-testid="hero-browse-btn" onClick={() => navigate("/cars")}
              className="group flex items-center gap-2 px-8 py-4 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors">
              Browse Inventory
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button data-testid="hero-sell-btn" onClick={() => navigate("/sell")}
              className="px-8 py-4 rounded-sm border border-white/20 text-[#F9F9F9] font-semibold hover:bg-white/5 hover:border-white/40 transition-colors">
              Sell Your Car
            </button>
          </div>
        </div>
      </section>

      <BrandRibbon />

      {/* Trust */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 py-20 grid sm:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, t: "NCT Verified", d: "Every car checked and roadworthy before sale" },
          { icon: BadgeCheck, t: "Full History", d: "Transparent service records on request" },
          { icon: Search, t: "Multi-point Inspection", d: "Mechanical and cosmetic assessment" },
        ].map((f, i) => (
          <div key={f.t} className="bg-[#121212] border border-[#2B2B2B] rounded-md p-7 card-hover animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="grid place-items-center w-12 h-12 rounded-sm bg-[#1A1A1A] text-[#C5A880] mb-5"><f.icon size={22} /></span>
            <p className="font-heading font-medium text-lg tracking-tight">{f.t}</p>
            <p className="text-sm text-[#888] mt-2 leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>

      {/* Featured */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="overline mb-3">Hand-picked</p>
            <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-light">Featured vehicles</h2>
          </div>
          <button onClick={() => navigate("/cars")} data-testid="view-all-btn"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#C5A880] hover:text-[#E0C39C] transition-colors">
            View all <ArrowRight size={16} />
          </button>
        </div>
        {featured.length === 0 ? (
          <p className="text-[#666]">No featured cars yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
          </div>
        )}
      </section>

      {/* Sell CTA */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 pb-8">
        <div className="relative overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#121212] p-10 sm:p-14 accent-glow">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#C5A880]/10 blur-3xl" />
          <div className="relative max-w-xl">
            <p className="overline mb-4">Sell with us</p>
            <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-light leading-tight">Have a car to sell? <span className="text-[#C5A880]">We'll handle it.</span></h2>
            <p className="text-[#888] mt-4 leading-relaxed">Upload a few photos and details — our team reviews every submission and gets back to you with a fair valuation.</p>
            <button onClick={() => navigate("/sell")} data-testid="cta-sell-btn"
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors">
              Start your listing <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
