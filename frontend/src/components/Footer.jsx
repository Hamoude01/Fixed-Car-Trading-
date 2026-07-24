import { Link } from "react-router-dom";
import { Car, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-zinc-300 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#10B981] text-white"><Car size={18} /></span>
            <span className="font-heading font-bold text-lg text-white">HamoudeCarTrade</span>
          </div>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
            Ireland's trusted destination for quality used cars. Every vehicle inspected, NCT checked, and ready to drive away.
          </p>
        </div>
        <div>
          <p className="overline text-zinc-500 mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/cars" className="hover:text-white transition-colors">Browse Cars</Link></li>
            <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin</Link></li>
          </ul>
        </div>
        <div>
          <p className="overline text-zinc-500 mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-center gap-2"><MapPin size={15} className="text-[#10B981]" /> Dublin, Ireland</li>
            <li className="flex items-center gap-2"><Phone size={15} className="text-[#10B981]" /> +353 1 234 5678</li>
            <li className="flex items-center gap-2"><Mail size={15} className="text-[#10B981]" /> sales@hamoudecartrade.ie</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} HamoudeCarTrade — Car Trading Ireland. All rights reserved.
      </div>
    </footer>
  );
}
