import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/lib/api/admin.functions";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getAllUsers(),
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Users</h1>
      <p className="text-sm text-muted-foreground mt-1">All registered users.</p>

      <div className="mt-6 bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Username</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Roles</th>
              <th className="text-left p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {(users as any[])?.map((u: any) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-semibold">{u.username || "—"}</td>
                <td className="p-3">{u.full_name || "—"}</td>
                <td className="p-3 text-xs">{u.email}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {u.roles.map((r: string) => (
                      <span key={r} className={`text-[10px] px-2 py-1 rounded uppercase ${r === "admin" ? "bg-gold text-white" : "bg-muted"}`}>{r}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(users as any[])?.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
