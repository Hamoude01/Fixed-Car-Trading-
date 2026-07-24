import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, LogOut, Car, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api, imageUrl, euro, km } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { PLACEHOLDER } from "../lib/data";

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
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
    } catch {
      toast.error("Failed to delete");
    }
  };

  const doLogout = () => { logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="admin-dashboard">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#0A0A0A] text-white"><Car size={18} /></span>
            <span className="font-heading font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#0A0A0A]">
              View site <ExternalLink size={14} />
            </Link>
            <span className="hidden sm:block text-sm text-zinc-400">{admin?.email}</span>
            <button onClick={doLogout} data-testid="logout-btn"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-red-500 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">Listings</h1>
            <p className="text-sm text-zinc-500 mt-1">{cars.length} total vehicles</p>
          </div>
          <Link to="/admin/cars/new" data-testid="add-car-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#10B981] text-white font-semibold hover:bg-emerald-600 transition-colors">
            <Plus size={18} /> Add car
          </Link>
        </div>

        {loading ? (
          <p className="text-zinc-400">Loading…</p>
        ) : cars.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl py-20 text-center text-zinc-400">
            No listings yet. Click “Add car” to create one.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F3F4F6] text-left">
                <tr className="overline">
                  <th className="px-4 py-3 font-bold">Vehicle</th>
                  <th className="px-4 py-3 font-bold hidden sm:table-cell">Price</th>
                  <th className="px-4 py-3 font-bold hidden md:table-cell">Mileage</th>
                  <th className="px-4 py-3 font-bold hidden md:table-cell">Photos</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c) => (
                  <tr key={c.id} className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors" data-testid={`admin-row-${c.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={c.images?.[0] ? imageUrl(c.images[0]) : PLACEHOLDER} alt="" loading="lazy"
                          className="w-14 h-11 object-cover rounded-md bg-zinc-100"
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                        <div>
                          <p className="font-medium leading-tight">{c.title}</p>
                          <p className="text-xs text-zinc-400">{c.make} · {c.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-semibold text-[#10B981]">{euro(c.price)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-zinc-500">{km(c.mileage)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-zinc-500">{c.images?.length || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/admin/cars/${c.id}/edit`)} data-testid={`edit-${c.id}`}
                          className="p-2 rounded-md hover:bg-zinc-100 transition-colors" aria-label="Edit"><Pencil size={16} /></button>
                        <button onClick={() => remove(c.id, c.title)} data-testid={`delete-${c.id}`}
                          className="p-2 rounded-md hover:bg-red-50 text-red-500 transition-colors" aria-label="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
