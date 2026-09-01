import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { api, imageUrl, euro, km } from "../../lib/api";
import { PLACEHOLDER } from "../../lib/data";

export default function Listings() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/cars").then((r) => setCars(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/cars/${id}`);
      toast.success("Listing deleted");
      setCars((p) => p.filter((c) => c.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const toggleStatus = async (id, current) => {
    const next = current === "sold" ? "available" : "sold";
    try {
      await api.patch(`/cars/${id}/status?status=${next}`);
      setCars((p) => p.map((c) => (c.id === id ? { ...c, status: next } : c)));
      toast.success(next === "sold" ? "Marked as sold" : "Marked as available");
    } catch { toast.error("Failed to update status"); }
  };

  return (
    <div data-testid="admin-listings">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-light tracking-tight">Listings</h1>
          <p className="text-sm text-[#888] mt-1">{cars.length} vehicles in inventory</p>
        </div>
        <Link to="/admin/listings/new" data-testid="add-car-btn"
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors">
          <Plus size={18} /> Add car
        </Link>
      </div>

      {loading ? (
        <p className="text-[#666]">Loading…</p>
      ) : cars.length === 0 ? (
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-md py-20 text-center text-[#666]">
          No listings yet. Click "Add car" to create one.
        </div>
      ) : (
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-[#1A1A1A] text-left">
              <tr>
                <th className="px-4 py-3 overline text-[#888]">Vehicle</th>
                <th className="px-4 py-3 overline text-[#888]">Price</th>
                <th className="px-4 py-3 overline text-[#888]">Status</th>
                <th className="px-4 py-3 overline text-[#888] hidden md:table-cell">Mileage</th>
                <th className="px-4 py-3 overline text-[#888] hidden md:table-cell">Photos</th>
                <th className="px-4 py-3 overline text-[#888] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((c) => (
                <tr key={c.id} className="border-t border-[#2B2B2B] hover:bg-[#1A1A1A] transition-colors" data-testid={`admin-row-${c.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.images?.[0] ? imageUrl(c.images[0]) : PLACEHOLDER} alt="" loading="lazy"
                        className="w-14 h-11 object-cover rounded-sm bg-[#1A1A1A]" onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                      <div>
                        <p className="font-medium leading-tight flex items-center gap-1.5">
                          {c.featured && <Star size={12} className="text-[#C5A880] fill-[#C5A880]" />}{c.title}
                        </p>
                        <p className="text-xs text-[#666]">{c.make} · {c.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-[#C5A880]">{euro(c.price)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(c.id, c.status)} data-testid={`status-toggle-${c.id}`}
                      title="Click to toggle available / sold"
                      className={`text-[0.65rem] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-sm transition-colors ${c.status === "sold" ? "bg-[#FF3B30]/15 text-[#FF3B30] hover:bg-[#FF3B30]/25" : "bg-[#1E9E5A]/15 text-[#3FD07E] hover:bg-[#1E9E5A]/25"}`}>
                      {c.status === "sold" ? "Sold" : "Available"}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#888] font-mono">{km(c.mileage)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-[#888]">{c.images?.length || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/admin/listings/${c.id}/edit`)} data-testid={`edit-${c.id}`}
                        className="p-2 rounded-sm hover:bg-[#2B2B2B] transition-colors" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={() => remove(c.id, c.title)} data-testid={`delete-${c.id}`}
                        className="p-2 rounded-sm hover:bg-[#FF3B30]/15 text-[#FF3B30] transition-colors" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
