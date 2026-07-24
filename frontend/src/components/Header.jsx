import { Link, useNavigate, useLocation } from "react-router-dom";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Inventory" },
  { to: "/sell", label: "Sell Your Car" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 glass-nav" data-testid="site-header">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-10 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="logo-link">
          <span className="grid place-items-center w-9 h-9 rounded-sm bg-[#C5A880] text-[#050505]">
            <Car size={18} />
          </span>
          <span className="font-heading font-semibold text-lg tracking-tight">
            Hamoude<span className="text-[#C5A880]">CarTrade</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`text-sm font-medium tracking-tight transition-colors ${pathname === l.to ? "text-[#C5A880]" : "text-[#888] hover:text-[#F9F9F9]"}`}>
              {l.label}
            </Link>
          ))}
          <button data-testid="header-sell-btn" onClick={() => navigate("/sell")}
            className="text-sm font-semibold px-5 py-2.5 rounded-sm bg-[#C5A880] text-[#050505] hover:bg-[#E0C39C] transition-colors">
            Sell Your Car
          </button>
        </nav>

        <button className="md:hidden text-[#F9F9F9]" onClick={() => setOpen(!open)} aria-label="Toggle menu" data-testid="mobile-menu-btn">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#050505] px-5 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-1 text-[#ccc]">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
