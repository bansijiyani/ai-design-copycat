"use client";


import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllUsers, promoteToAdmin, deleteUserAdmin } from "@/lib/api/admin.functions";



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

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await deleteUserAdmin({ data: { userId } });
      toast.success("User deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
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
              <tr key={u.id} className="border-t border-border align-middle hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id.slice(0, 8)}</td>
                <td className="px-4 py-3 font-semibold">{u.full_name || "—"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="bg-forest/10 text-forest px-2 py-0.5 rounded text-[10px] font-bold uppercase">Yes</span>
                </td>
                <td className="px-4 py-3">
                  {u.roles?.includes("admin") ? (
                    <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Admin</span>
                  ) : (
                    <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase">User</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4 items-center">
                    {!u.roles?.includes("admin") && (
                      <button 
                        onClick={() => handlePromote(u.id)}
                        className="text-xs font-medium text-foreground hover:underline"
                      >
                        Make Admin
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="text-xs font-medium text-maroon hover:underline"
                    >
                      Delete
                    </button>
                  </div>
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
