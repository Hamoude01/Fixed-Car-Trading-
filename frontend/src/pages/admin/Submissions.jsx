import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Trash2, Check, X, Eye, ChevronRight, Images } from "lucide-react";
import { toast } from "sonner";
import { api, imageUrl } from "../../lib/api";

const STATUS = {
  pending: { label: "Pending", cls: "bg-[#C5A880]/15 text-[#C5A880]" },
  reviewed: { label: "Reviewed", cls: "bg-blue-500/15 text-blue-400" },
  accepted: { label: "Accepted", cls: "bg-[#34C759]/15 text-[#34C759]" },
  rejected: { label: "Rejected", cls: "bg-[#FF3B30]/15 text-[#FF3B30]" },
};
const FILTERS = ["all", "pending", "reviewed", "accepted", "rejected"];

export default function Submissions() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);

  const load = () => {
    const params = filter === "all" ? {} : { status: filter };
    api.get("/submissions", { params }).then((r) => setSubs(r.data)).catch(() => {});
  };
  useEffect(load, [filter]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/submissions/${id}/status`, null, { params: { status } });
      toast.success(`Marked ${status}`);
      setActive((a) => (a && a.id === id ? { ...a, status } : a));
      load();
    } catch { toast.error("Failed to update"); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this submission?")) return;
    try {
      await api.delete(`/submissions/${id}`);
      toast.success("Deleted");
      setActive(null);
      load();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div data-testid="admin-submissions">
      <h1 className="font-heading text-3xl font-light tracking-tight">Sell Requests</h1>
      <p className="text-sm text-[#888] mt-1 mb-7">Customer submissions to sell their car</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} data-testid={`sub-filter-${f}`}
            className={`px-4 py-2 rounded-sm text-sm font-medium capitalize transition-colors ${filter === f ? "bg-[#C5A880] text-[#050505]" : "bg-[#1A1A1A] text-[#888] hover:text-[#F9F9F9]"}`}>
            {f}
          </button>
        ))}
      </div>

      {subs.length === 0 ? (
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-md py-20 text-center text-[#666]">No submissions{filter !== "all" ? ` marked ${filter}` : ""}.</div>
      ) : (
        <div className="grid gap-3">
          {subs.map((s) => (
            <div key={s.id} data-testid={`submission-${s.id}`}
              className="bg-[#121212] border border-[#2B2B2B] rounded-md p-5 hover:border-white/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-16 rounded-sm overflow-hidden bg-[#1A1A1A] shrink-0">
                  {s.images?.[0] ? (
                    <img src={imageUrl(s.images[0])} alt="" loading="lazy" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full grid place-items-center text-[#444]"><Images size={20} /></div>}
                  {s.images?.length > 1 && <span className="absolute bottom-0.5 right-0.5 text-[0.6rem] bg-black/70 px-1 rounded-sm">{s.images.length}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-medium">{s.make} {s.model} <span className="text-[#666] font-normal">· {s.year || "—"}</span></p>
                    <span className={`text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm ${STATUS[s.status]?.cls}`}>{STATUS[s.status]?.label}</span>
                  </div>
                  <p className="text-sm text-[#888] mt-1">{s.name} · {s.phone}{s.askingPrice ? ` · asking €${s.askingPrice}` : ""}</p>
                  {s.mileage && <p className="text-xs text-[#666] mt-0.5">{s.mileage} km{s.county ? ` · ${s.county}` : ""}</p>}
                </div>
                <button onClick={() => setActive(s)} data-testid={`view-submission-${s.id}`}
                  className="flex items-center gap-1 text-sm text-[#C5A880] hover:text-[#E0C39C] transition-colors shrink-0">
                  <Eye size={15} /> <span className="hidden sm:inline">View</span> <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {active && (
        <div className="fixed inset-0 z-[60] flex justify-end" data-testid="submission-drawer">
          <div className="absolute inset-0 bg-black/70" onClick={() => setActive(null)} />
          <div className="relative w-full max-w-lg bg-[#0A0A0A] border-l border-[#2B2B2B] h-full overflow-y-auto p-7 animate-fade-up">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="overline mb-1">Sell request</p>
                <h2 className="font-heading text-2xl font-light">{active.make} {active.model}</h2>
                <p className="text-sm text-[#888]">{active.year || "—"} · {active.mileage || "—"} km</p>
              </div>
              <button onClick={() => setActive(null)} className="p-2 hover:bg-[#1A1A1A] rounded-sm"><X size={18} /></button>
            </div>

            {active.images?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {active.images.map((img, i) => (
                  <a key={i} href={imageUrl(img)} target="_blank" rel="noreferrer" className="aspect-square rounded-sm overflow-hidden bg-[#1A1A1A]">
                    <img src={imageUrl(img)} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            <div className="space-y-3 bg-[#121212] border border-[#2B2B2B] rounded-md p-5 mb-5 text-sm">
              <div className="flex items-center gap-3"><Phone size={15} className="text-[#C5A880]" /> <a href={`tel:${active.phone}`} className="hover:text-[#C5A880]">{active.phone}</a></div>
              <div className="flex items-center gap-3"><Mail size={15} className="text-[#C5A880]" /> <a href={`mailto:${active.email}`} className="hover:text-[#C5A880]">{active.email}</a></div>
              {active.county && <div className="flex items-center gap-3"><MapPin size={15} className="text-[#C5A880]" /> {active.county}</div>}
              {active.askingPrice && <div className="font-mono text-[#C5A880]">Asking: €{active.askingPrice}</div>}
            </div>

            {active.description && (
              <div className="mb-6">
                <p className="overline mb-2 text-[#888]">Notes</p>
                <p className="text-sm text-[#aaa] leading-relaxed whitespace-pre-line">{active.description}</p>
              </div>
            )}

            <p className="overline mb-3 text-[#888]">Update status</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setStatus(active.id, "reviewed")} data-testid="mark-reviewed" className="py-2.5 rounded-sm bg-[#1A1A1A] text-blue-400 text-sm font-medium hover:bg-[#222] transition-colors">Reviewed</button>
              <button onClick={() => setStatus(active.id, "accepted")} data-testid="mark-accepted" className="py-2.5 rounded-sm bg-[#1A1A1A] text-[#34C759] text-sm font-medium hover:bg-[#222] transition-colors flex items-center justify-center gap-1"><Check size={15} /> Accept</button>
              <button onClick={() => setStatus(active.id, "rejected")} data-testid="mark-rejected" className="py-2.5 rounded-sm bg-[#1A1A1A] text-[#FF3B30] text-sm font-medium hover:bg-[#222] transition-colors">Reject</button>
              <button onClick={() => setStatus(active.id, "pending")} className="py-2.5 rounded-sm bg-[#1A1A1A] text-[#C5A880] text-sm font-medium hover:bg-[#222] transition-colors">Pending</button>
            </div>
            <button onClick={() => remove(active.id)} data-testid="delete-submission"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border border-[#FF3B30]/30 text-[#FF3B30] text-sm font-medium hover:bg-[#FF3B30]/10 transition-colors">
              <Trash2 size={15} /> Delete submission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
