import { Link } from "react-router-dom";
import { Car, MapPin, Phone, Mail, Globe } from "lucide-react";
import { SITE } from "../lib/site";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="border-t border-[#2B2B2B] bg-[#050505] mt-0 relative z-[2]" data-testid="site-footer">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="grid place-items-center w-9 h-9 rounded-sm bg-[#C5A880] text-[#050505]"><Car size={18} /></span>
            <span className="font-heading font-semibold text-lg">HamoudeCarTrade</span>
          </div>
          <p className="text-sm text-[#888] max-w-sm leading-relaxed mb-6">
            Ireland's destination for premium used cars. Every vehicle inspected, NCT verified, and delivered with a level of care worthy of the marque.
          </p>
          <SocialLinks />
        </div>
        <div>
          <p className="overline mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm text-[#888]">
            <li><Link to="/cars" className="hover:text-[#C5A880] transition-colors">Inventory</Link></li>
            <li><Link to="/sell" className="hover:text-[#C5A880] transition-colors">Sell Your Car</Link></li>
            <li><Link to="/contact" className="hover:text-[#C5A880] transition-colors">Contact</Link></li>
            <li>
              <a href={SITE.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#C5A880] transition-colors">
                <Globe size={13} /> {SITE.websiteLabel}
              </a>
            </li>
            <li><Link to="/admin/login" className="hover:text-[#C5A880] transition-colors">Admin</Link></li>
          </ul>
        </div>
        <div>
          <p className="overline mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-[#888]">
            <li className="flex items-center gap-2.5"><MapPin size={15} className="text-[#C5A880] shrink-0" /> {SITE.address}</li>
            <li><a href={`tel:${SITE.phoneTel}`} className="flex items-center gap-2.5 hover:text-[#C5A880] transition-colors"><Phone size={15} className="text-[#C5A880] shrink-0" /> {SITE.phoneDisplay}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 hover:text-[#C5A880] transition-colors break-all"><Mail size={15} className="text-[#C5A880] shrink-0" /> {SITE.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2B2B2B] py-5 text-center text-xs text-[#555]">
        © {new Date().getFullYear()} HamoudeCarTrade — Car Trading Ireland. All rights reserved.
      </div>
    </footer>
  );
}
