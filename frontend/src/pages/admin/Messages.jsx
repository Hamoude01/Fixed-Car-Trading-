import { useEffect, useState } from "react";
import { Mail, Phone, Trash2, MailOpen, Circle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";

export default function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [open, setOpen] = useState(null);

  const load = () => api.get("/contact").then((r) => setMsgs(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openMsg = async (m) => {
    setOpen(m.id === open ? null : m.id);
    if (m.status === "unread") {
      try {
        await api.patch(`/contact/${m.id}/status`, null, { params: { status: "read" } });
        setMsgs((p) => p.map((x) => (x.id === m.id ? { ...x, status: "read" } : x)));
      } catch {}
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success("Deleted");
      setMsgs((p) => p.filter((x) => x.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const unread = msgs.filter((m) => m.status === "unread").length;

  return (
    <div data-testid="admin-messages">
      <h1 className="font-heading text-3xl font-light tracking-tight">Messages</h1>
      <p className="text-sm text-[#888] mt-1 mb-7">{unread} unread · {msgs.length} total</p>

      {msgs.length === 0 ? (
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-md py-20 text-center text-[#666]">No messages yet.</div>
      ) : (
        <div className="grid gap-3">
          {msgs.map((m) => (
            <div key={m.id} data-testid={`message-${m.id}`}
              className={`bg-[#121212] border rounded-md transition-colors ${m.status === "unread" ? "border-[#C5A880]/40" : "border-[#2B2B2B]"}`}>
              <button onClick={() => openMsg(m)} data-testid={`open-message-${m.id}`}
                className="w-full flex items-center gap-4 p-5 text-left">
                <span className="shrink-0 text-[#C5A880]">
                  {m.status === "unread" ? <Circle size={10} className="fill-[#C5A880]" /> : <MailOpen size={16} className="text-[#666]" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`truncate ${m.status === "unread" ? "font-semibold" : "font-medium text-[#ccc]"}`}>{m.name}</p>
                    {m.subject && <span className="text-xs text-[#666] truncate">— {m.subject}</span>}
                  </div>
                  <p className="text-sm text-[#888] truncate mt-0.5">{m.message}</p>
                </div>
              </button>
              {open === m.id && (
                <div className="px-5 pb-5 pt-1 border-t border-[#2B2B2B]">
                  <p className="text-sm text-[#aaa] leading-relaxed whitespace-pre-line mb-4">{m.message}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-[#C5A880] hover:text-[#E0C39C]"><Mail size={14} /> {m.email}</a>
                    {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-[#C5A880] hover:text-[#E0C39C]"><Phone size={14} /> {m.phone}</a>}
                    <button onClick={() => remove(m.id)} data-testid={`delete-message-${m.id}`}
                      className="flex items-center gap-1.5 text-[#FF3B30] hover:opacity-80 ml-auto"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
