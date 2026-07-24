import { Link } from "react-router-dom";
import { Car, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#2B2B2B] bg-[#050505] mt-28 relative z-[2]" data-testid="site-footer">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="grid place-items-center w-9 h-9 rounded-sm bg-[#C5A880] text-[#050505]"><Car size={18} /></span>
            <span className="font-heading font-semibold text-lg">HamoudeCarTrade</span>
          </div>
          <p className="text-sm text-[#888] max-w-sm leading-relaxed">
            Ireland's destination for premium used cars. Every vehicle inspected, NCT verified, and delivered with a level of care worthy of the marque.
          </p>
        </div>
        <div>
          <p className="overline mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm text-[#888]">
            <li><Link to="/cars" className="hover:text-[#C5A880] transition-colors">Inventory</Link></li>
            <li><Link to="/sell" className="hover:text-[#C5A880] transition-colors">Sell Your Car</Link></li>
            <li><Link to="/contact" className="hover:text-[#C5A880] transition-colors">Contact</Link></li>
            <li><Link to="/admin/login" className="hover:text-[#C5A880] transition-colors">Admin</Link></li>
          </ul>
        </div>
        <div>
          <p className="overline mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-[#888]">
            <li className="flex items-center gap-2.5"><MapPin size={15} className="text-[#C5A880]" /> Dublin, Ireland</li>
            <li className="flex items-center gap-2.5"><Phone size={15} className="text-[#C5A880]" /> +353 1 234 5678</li>
            <li className="flex items-center gap-2.5"><Mail size={15} className="text-[#C5A880]" /> sales@hamoudecartrade.ie</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2B2B2B] py-5 text-center text-xs text-[#555]">
        © {new Date().getFullYear()} HamoudeCarTrade — Car Trading Ireland. All rights reserved.
      </div>
    </footer>
  );
}
