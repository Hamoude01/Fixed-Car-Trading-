import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, ShieldCheck, Search, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { SHOWCASE } from "../lib/site";
import CarCard from "../components/CarCard";
import BrandRibbon from "../components/BrandRibbon";
import Reveal from "../components/Reveal";

// Full-viewport cinematic showcase panel (Apple product-page style).
const Showcase = ({ image, overline, title, accent, copy, primary, onPrimary, align = "center", dark }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <motion.img
      src={image} alt="" initial={{ scale: 1.12 }} whileInView={{ scale: 1 }}
      viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className={`absolute inset-0 ${dark ? "bg-black/60" : "bg-gradient-to-t from-black/85 via-black/30 to-black/50"}`} />
    <div className={`relative z-[2] max-w-3xl px-6 ${align === "center" ? "text-center" : ""}`}>
      <Reveal><p className="overline mb-5">{overline}</p></Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-heading text-4xl sm:text-6xl tracking-tighter font-light leading-[1.02]">
          {title} {accent && <span className="text-[#C5A880] font-semibold">{accent}</span>}
        </h2>
      </Reveal>
      <Reveal delay={0.16}><p className="mt-6 text-lg text-[#cfcfcf] max-w-xl mx-auto leading-relaxed">{copy}</p></Reveal>
      {primary && (
        <Reveal delay={0.24}>
          <button onClick={onPrimary} data-testid="showcase-cta"
            className="group mt-9 inline-flex items-center gap-2 text-[#C5A880] font-semibold text-lg hover:text-[#E0C39C] transition-colors">
            {primary} <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </Reveal>
      )}
    </div>
  </section>
);

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/cars", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO — Apple-style: centered, huge type, product beneath */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <img src={SHOWCASE.hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#050505]" />
        <div className="relative z-[2] px-6">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="overline mb-6">Car Trading Ireland</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading text-6xl sm:text-8xl tracking-tighter font-light leading-[0.95]">
            The car you want.<br /><span className="text-[#C5A880] font-semibold">Delivered right.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-7 text-lg sm:text-xl text-[#cfcfcf] max-w-xl mx-auto leading-relaxed">
            A curated collection of premium used cars — inspected, verified, and ready to drive away.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-9 flex items-center justify-center gap-8">
            <button data-testid="hero-browse-btn" onClick={() => navigate("/cars")}
              className="group inline-flex items-center gap-2 text-[#C5A880] font-semibold text-lg hover:text-[#E0C39C] transition-colors">
              Explore inventory <ArrowRight size={19} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button data-testid="hero-sell-btn" onClick={() => navigate("/sell")}
              className="group inline-flex items-center gap-2 text-[#F9F9F9] font-semibold text-lg hover:text-white transition-colors">
              Sell your car <ArrowRight size={19} className="group-hover:translate-x-1.5 transition-transform" />
            </button>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 z-[2] text-[#888]">
          <ChevronDown size={26} className="animate-bounce" />
        </motion.div>
      </section>

      <BrandRibbon />

      {/* SHOWCASE 1 — Inventory */}
      <Showcase image={SHOWCASE.inventory} overline="The Collection"
        title="Every car," accent="hand-picked."
        copy="We don't list everything. We list the right things — each vehicle chosen, inspected and prepared to a standard we'd drive ourselves."
        primary="Browse the collection" onPrimary={() => navigate("/cars")} />

      {/* Detail band — two-up imagery like Huawei feature grid */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 py-28">
        <Reveal className="mb-16">
          <p className="overline mb-4 text-center">Attention to detail</p>
          <h2 className="font-heading text-4xl sm:text-5xl tracking-tighter font-light text-center leading-tight">
            Built on <span className="text-[#C5A880] font-semibold">trust,</span> down to the last detail.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="relative rounded-lg overflow-hidden aspect-[4/3] group">
              <img src={SHOWCASE.interior} alt="Interior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-8">
                <p className="overline mb-2">Interiors</p>
                <p className="font-heading text-2xl font-light">Cabins that feel brand new.</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="relative rounded-lg overflow-hidden aspect-[4/3] group">
              <img src={SHOWCASE.detail} alt="Detail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-8">
                <p className="overline mb-2">Mechanicals</p>
                <p className="font-heading text-2xl font-light">Inspected before they're listed.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust metrics */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 pb-8 grid sm:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, t: "NCT Verified", d: "Every car checked and roadworthy before sale" },
          { icon: BadgeCheck, t: "Full History", d: "Transparent service records on request" },
          { icon: Search, t: "Multi-point Inspection", d: "Mechanical and cosmetic assessment" },
        ].map((f, i) => (
          <Reveal key={f.t} delay={i * 0.08}>
            <div className="bg-[#121212] border border-[#2B2B2B] rounded-md p-7 card-hover h-full">
              <span className="grid place-items-center w-12 h-12 rounded-sm bg-[#1A1A1A] text-[#C5A880] mb-5"><f.icon size={22} /></span>
              <p className="font-heading font-medium text-lg tracking-tight">{f.t}</p>
              <p className="text-sm text-[#888] mt-2 leading-relaxed">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Featured */}
      <section className="max-w-[1400px] mx-auto px-5 sm:px-10 py-24">
        <Reveal>
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
        </Reveal>
        {featured.length === 0 ? (
          <p className="text-[#666]">No featured cars yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
          </div>
        )}
      </section>

      {/* SHOWCASE 2 — Sell */}
      <Showcase image={SHOWCASE.sell} overline="Sell with us" dark
        title="Got a car to sell?" accent="We'll handle it."
        copy="Upload a few photos and details. Our team reviews every submission and comes back with a fair, market-based valuation — no pressure, no obligation."
        primary="Start your valuation" onPrimary={() => navigate("/sell")} />
    </div>
  );
}
