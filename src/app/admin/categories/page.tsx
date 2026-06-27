"use client";


import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api/admin.functions";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";



type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  section: string;
  image: string;
  is_active: boolean;
};

const emptyCategory: CategoryForm = {
  name: "",
  slug: "",
  section: "ethnic",
  image: "",
  is_active: true,
};

export default function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CategoryForm | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const openNew = () => setEditing({ ...emptyCategory });

  const openEdit = (c: any) => {
    setEditing({
      id: c.id,
      name: c.name,
      slug: c.slug,
      section: c.section,
      image: c.image || "",
      is_active: c.is_active ?? true,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        slug: editing.slug,
        section: editing.section,
        image: editing.image || null,
        is_active: editing.is_active,
      };

      if (editing.id) {
        await updateCategory({ data: { id: editing.id, ...payload } });
      } else {
        await createCategory({ data: payload });
      }

      toast.success(editing.id ? "Category updated" : "Category created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? (This might fail if products are linked to it)")) return;
    try {
      await deleteCategory({ data: { id } });
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product categories.</p>
        </div>
        <button onClick={openNew} className="bg-gold text-white px-5 py-2.5 text-sm font-semibold rounded flex items-center gap-2 hover:bg-gold/90">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="mt-6 bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Image</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Section</th>
              <th className="text-center p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {(categories as any[]).map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">
                  {c.image && (
                    <img src={c.image} alt={c.name} className="w-12 h-12 object-cover rounded" />
                  )}
                </td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3 capitalize">{c.section}</td>
                <td className="p-3 text-center">
                  <span className={`text-[10px] px-2 py-1 rounded ${(c.is_active ?? true) ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground"}`}>
                    {(c.is_active ?? true) ? "ACTIVE" : "HIDDEN"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:text-gold"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(c.id)} className="p-1.5 hover:text-maroon"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {(categories as any[])?.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-lg max-w-xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-2xl">{editing.id ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 grid gap-4">
              <Field label="Name">
                <input 
                  value={editing.name} 
                  onChange={(e) => setEditing({ 
                    ...editing, 
                    name: e.target.value, 
                    slug: editing.id ? editing.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") 
                  })} 
                  className="input" 
                />
              </Field>
              <Field label="Slug"><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input" /></Field>
              <Field label="Section">
                <select value={editing.section} onChange={(e) => setEditing({ ...editing, section: e.target.value })} className="input">
                  <option value="ethnic">ethnic</option>
                  <option value="western">western</option>
                </select>
              </Field>
              <Field label="Active">
                <select value={editing.is_active ? "1" : "0"} onChange={(e) => setEditing({ ...editing, is_active: e.target.value === "1" })} className="input">
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </Field>
              <Field label="Category Image">
                <CloudinaryUpload
                  value={editing.image ? [editing.image] : []}
                  onUpload={(url) => setEditing({ ...editing, image: url })}
                  onRemove={() => setEditing({ ...editing, image: "" })}
                />
              </Field>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm border border-border rounded">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2.5 text-sm bg-gold text-white font-semibold rounded disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;padding:0.6rem 0.75rem;background:hsl(var(--muted,0 0% 96%));border:1px solid hsl(var(--border));border-radius:4px;font-size:0.875rem;outline:none}.input:focus{border-color:#c9a14a}`}</style>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
