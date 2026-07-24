import { BRAND_RIBBON } from "../lib/data";

export default function BrandRibbon() {
  const items = [...BRAND_RIBBON, ...BRAND_RIBBON];
  return (
    <div className="border-y border-[#2B2B2B] bg-[#050505] py-6 overflow-hidden" data-testid="brand-ribbon">
      <div className="marquee-track">
        {items.map((b, i) => (
          <span key={i} className="flex items-center gap-10 px-10 text-lg font-heading font-light tracking-widest text-[#555] whitespace-nowrap">
            {b}
            <span className="text-[#C5A880]">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
