import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Search, BadgeCheck } from "lucide-react";
import { api } from "../lib/api";
import CarCard from "../components/CarCard";

const HERO = "https://images.pexels.com/photos/3470473/pexels-photo-3470473.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/cars", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0A0A0A] text-white">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
          <p className="overline text-[#10B981] mb-5 animate-fade-up">Car Trading Ireland</p>
          <h1 className="font-heading text-5xl sm:text-6xl tracking-tighter font-semibold max-w-3xl leading-[1.05] animate-fade-up" style={{ animationDelay: "80ms" }}>
            Quality used cars, <span className="text-[#10B981]">honestly priced.</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-300 max-w-xl animate-fade-up" style={{ animationDelay: "160ms" }}>
            Hand-picked, fully inspected vehicles from across Ireland. Browse the inventory and find your next car today.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
            <button data-testid="hero-browse-btn" onClick={() => navigate("/cars")}
              className="group flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#10B981] text-white font-semibold hover:bg-emerald-600 transition-colors">
              Browse Inventory
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid sm:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, t: "NCT Checked", d: "Every car verified and roadworthy" },
            { icon: BadgeCheck, t: "Full History", d: "Transparent service records" },
            { icon: Search, t: "Inspected", d: "Multi-point mechanical check" },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-4">
              <span className="grid place-items-center w-11 h-11 rounded-lg bg-[#F3F4F6] text-[#0A0A0A] shrink-0"><f.icon size={20} /></span>
              <div>
                <p className="font-heading font-semibold">{f.t}</p>
                <p className="text-sm text-zinc-500">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="overline mb-2">Hand-picked</p>
            <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-medium">Featured vehicles</h2>
          </div>
          <button onClick={() => navigate("/cars")} data-testid="view-all-btn"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:text-[#10B981] transition-colors">
            View all <ArrowRight size={16} />
          </button>
        </div>
        {featured.length === 0 ? (
          <p className="text-zinc-400">No featured cars yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}
