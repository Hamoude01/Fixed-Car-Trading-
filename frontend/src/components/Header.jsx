import { Link, useNavigate } from "react-router-dom";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/cars", label: "Browse Cars" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 glass-nav" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#0A0A0A] text-white">
            <Car size={18} />
          </span>
          <span className="font-heading font-bold text-lg tracking-tight">
            Hamoude<span className="text-[#10B981]">CarTrade</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium text-zinc-600 hover:text-[#0A0A0A] transition-colors">
              {l.label}
            </Link>
          ))}
          <button data-testid="header-browse-btn" onClick={() => navigate("/cars")}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-[#0A0A0A] text-white hover:bg-zinc-800 transition-colors">
            View Inventory
          </button>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" data-testid="mobile-menu-btn">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-black/5 bg-white px-5 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-1">{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
