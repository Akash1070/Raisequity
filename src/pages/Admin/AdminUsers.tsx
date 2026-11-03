import { useEffect, useState } from "react";
import { Search, Trash2, Activity, UserCheck } from "lucide-react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(query(collection(db, "users"), limit(150)));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure? This will delete the user profile.")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const filtered = users.filter(u => {
    const nameMatch = u.full_name?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = u.email?.toLowerCase().includes(search.toLowerCase());
    const idMatch = u.id?.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = !search || nameMatch || emailMatch || idMatch;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading user database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Users & Access</h1>
          <p className="text-gray-500 font-medium mt-1">{users.length} registered platform accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, email, or user ID..." 
            className="w-full bg-white border border-[var(--color-clay-border,#e5e2dc)] rounded-2xl pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none shadow-xs" 
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)} 
          className="bg-white border border-[var(--color-clay-border,#e5e2dc)] rounded-2xl px-5 py-3 text-sm text-black font-bold outline-none shadow-xs cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="founder">Founders</option>
          <option value="investor">Investors</option>
          <option value="service_provider">Service Providers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">User Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Assigned Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">LinkedIn</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-black text-sm shadow-xs">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-black">{user.full_name || "Unnamed Account"}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{user.email || user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role || "founder"} 
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="bg-gray-50 text-black text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 outline-none cursor-pointer hover:bg-gray-100"
                    >
                      <option value="founder">Founder</option>
                      <option value="investor">Investor</option>
                      <option value="service_provider">Provider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full border ${
                      user.onboarding_completed 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {user.onboarding_completed ? "ACTIVE" : "ONBOARDING"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.linkedin_url ? (
                      <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="text-black text-xs font-bold hover:underline underline-offset-2">
                        Profile ↗
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Recent"}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No matching users found</div>
        )}
      </div>
    </div>
  );
}
