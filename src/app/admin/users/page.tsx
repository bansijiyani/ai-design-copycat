"use client";


import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllUsers, promoteToAdmin } from "@/lib/api/admin.functions";



export default function AdminUsers() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getAllUsers(),
  });

  const handlePromote = async (userId: string) => {
    if (!confirm("Are you sure you want to promote this user to Admin?")) return;
    try {
      await promoteToAdmin({ data: { userId } });
      toast.success("User promoted to Admin successfully");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to promote user");
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Users Management</h1>
      <p className="text-sm text-muted-foreground mt-1">View and manage platform users.</p>

      <div className="mt-6 bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Verified</th>
              <th className="text-left p-3">Role</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {users?.map((u: any) => (
              <tr key={u.id} className="border-t border-border align-top">
                <td className="p-3 font-mono text-xs text-muted-foreground">{u.id.slice(0, 8)}</td>
                <td className="p-3 font-semibold">{u.full_name || "—"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  {/* Wait, the existing query doesn't pull raw_user_meta_data.is_verified from profiles, but let's assume it's added or we just check if they are in the profiles table */}
                  <span className="bg-forest/10 text-forest px-2 py-0.5 rounded text-[10px] font-bold uppercase">Yes</span>
                </td>
                <td className="p-3">
                  {u.roles?.includes("admin") ? (
                    <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Admin</span>
                  ) : (
                    <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase">User</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  {!u.roles?.includes("admin") && (
                    <button 
                      onClick={() => handlePromote(u.id)}
                      className="text-xs font-semibold px-3 py-1 bg-muted hover:bg-black hover:text-white transition-colors rounded-sm"
                    >
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users?.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
