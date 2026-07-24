import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Inbox, MessageSquare, Wallet, Plus, ArrowUpRight, Clock } from "lucide-react";
import { api, euro, imageUrl } from "../../lib/api";
import { PLACEHOLDER } from "../../lib/data";

const Metric = ({ icon: Icon, label, value, accent, to }) => {
  const inner = (
    <div className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6 card-hover h-full">
      <div className="flex items-center justify-between">
        <span className={`grid place-items-center w-11 h-11 rounded-sm ${accent ? "bg-[#C5A880] text-[#050505]" : "bg-[#1A1A1A] text-[#C5A880]"}`}><Icon size={20} /></span>
        {to && <ArrowUpRight size={17} className="text-[#555]" />}
      </div>
      <p className="font-mono font-semibold text-3xl mt-5">{value}</p>
      <p className="overline mt-1.5 text-[#888]">{label}</p>
    </div>
  );
  return to ? <Link to={to} data-testid={`metric-${label.toLowerCase().replace(/\s/g, "-")}`}>{inner}</Link> : <div data-testid={`metric-${label.toLowerCase().replace(/\s/g, "-")}`}>{inner}</div>;
};

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/cars").then((r) => setRecent(r.data.slice(0, 5))).catch(() => {});
    api.get("/submissions", { params: { status: "pending" } }).then((r) => setSubs(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-overview">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-light tracking-tight">Overview</h1>
          <p className="text-sm text-[#888] mt-1">Your showroom at a glance</p>
        </div>
        <Link to="/admin/listings/new" data-testid="overview-add-btn"
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors">
          <Plus size={18} /> Add car
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Metric icon={Car} label="Total Listings" value={stats?.totalListings ?? "—"} to="/admin/listings" />
        <Metric icon={Wallet} label="Inventory Value" value={stats ? euro(stats.inventoryValue) : "—"} accent />
        <Metric icon={Inbox} label="Pending Sell Requests" value={stats?.pendingSubmissions ?? "—"} to="/admin/submissions" />
        <Metric icon={MessageSquare} label="Unread Messages" value={stats?.unreadMessages ?? "—"} to="/admin/messages" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent listings */}
        <section className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-medium">Recent listings</h2>
            <Link to="/admin/listings" className="text-xs text-[#C5A880] hover:text-[#E0C39C]">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-[#666]">No listings yet.</p>}
            {recent.map((c) => (
              <Link key={c.id} to={`/admin/listings/${c.id}/edit`} className="flex items-center gap-3 group">
                <img src={c.images?.[0] ? imageUrl(c.images[0]) : PLACEHOLDER} alt="" loading="lazy"
                  className="w-12 h-10 object-cover rounded-sm bg-[#1A1A1A]" onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-[#C5A880] transition-colors">{c.title}</p>
                  <p className="text-xs text-[#666]">{c.images?.length || 0} photos</p>
                </div>
                <span className="font-mono text-sm text-[#C5A880]">{euro(c.price)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Pending sell requests */}
        <section className="bg-[#121212] border border-[#2B2B2B] rounded-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-medium">New sell requests</h2>
            <Link to="/admin/submissions" className="text-xs text-[#C5A880] hover:text-[#E0C39C]">View all</Link>
          </div>
          <div className="space-y-3">
            {subs.length === 0 && <p className="text-sm text-[#666]">No pending requests.</p>}
            {subs.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-sm bg-[#1A1A1A] text-[#C5A880] shrink-0"><Clock size={15} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.make} {s.model} <span className="text-[#666]">· {s.year || "—"}</span></p>
                  <p className="text-xs text-[#666]">{s.name} · {s.phone}</p>
                </div>
                {s.askingPrice && <span className="font-mono text-sm text-[#888]">€{s.askingPrice}</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
