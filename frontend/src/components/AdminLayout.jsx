import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Car, Inbox, MessageSquare, LogOut, ExternalLink, Gauge } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState({ pendingSubmissions: 0, unreadMessages: 0 });

  useEffect(() => {
    api.get("/admin/stats").then((r) => setBadges(r.data)).catch(() => {});
  }, []);

  const nav = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/listings", label: "Listings", icon: Car },
    { to: "/admin/submissions", label: "Sell Requests", icon: Inbox, badge: badges.pendingSubmissions },
    { to: "/admin/messages", label: "Messages", icon: MessageSquare, badge: badges.unreadMessages },
  ];

  const doLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-[#050505] flex" data-testid="admin-layout">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#2B2B2B] bg-[#0A0A0A] sticky top-0 h-screen">
        <div className="h-[72px] flex items-center gap-2.5 px-6 border-b border-[#2B2B2B]">
          <span className="grid place-items-center w-8 h-8 rounded-sm bg-[#C5A880] text-[#050505]"><Gauge size={17} /></span>
          <span className="font-heading font-semibold tracking-tight">Command Center</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} data-testid={`nav-admin-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                isActive ? "bg-[#C5A880] text-[#050505]" : "text-[#888] hover:text-[#F9F9F9] hover:bg-[#1A1A1A]"}`}>
              <n.icon size={17} />
              <span className="flex-1">{n.label}</span>
              {n.badge > 0 && (
                <span className="text-[0.65rem] font-bold min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-[#FF3B30] text-white">{n.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2B2B2B] space-y-2">
          <Link to="/" target="_blank" className="flex items-center gap-2 px-3.5 py-2 text-sm text-[#888] hover:text-[#F9F9F9] transition-colors">
            <ExternalLink size={15} /> View live site
          </Link>
          <button onClick={doLogout} data-testid="logout-btn"
            className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-[#888] hover:text-[#FF3B30] transition-colors">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden glass-nav sticky top-0 z-40 h-14 flex items-center justify-between px-5">
          <span className="font-heading font-semibold">Admin</span>
          <div className="flex items-center gap-4">
            {nav.slice(1).map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `text-xs ${isActive ? "text-[#C5A880]" : "text-[#888]"}`}>{n.label}</NavLink>
            ))}
            <button onClick={doLogout} className="text-[#888]"><LogOut size={16} /></button>
          </div>
        </header>
        <div className="p-5 sm:p-8">
          <p className="text-xs text-[#666] mb-6 hidden lg:block">Signed in as <span className="text-[#888]">{admin?.email}</span></p>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
