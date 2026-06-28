"use client";


import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api/product.functions";
import { getCategories } from "@/lib/api/admin.functions";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



type VariantForm = {
  id?: string;
  sku: string;
  size: string;
  color_name: string;
  color_hex: string;
  price_override: number | null;
  stock: number;
  is_active: boolean;
  images?: string[];
};

type ProductForm = {
  id?: string;
  name: string;
  brand: string;
  category: string;
  category_id: string | null;
  section: string;
  price: number;
  old_price: number | null;
  stock: number;
  sku: string;
  image: string;
  images: string[];
  description: string;
  is_active: boolean;
  variants: VariantForm[];
  item: string;
  fabric: string;
  work_technique: string;
  value_edition: string;
  style: string;
  length: string;
  width: string;
  wash_care: string;
  return_window: string;
  _isCustomReturn?: boolean;
  exchange_window: string;
  _isCustomExchange?: boolean;
};

const emptyVariant: VariantForm = {
  sku: "", size: "", color_name: "", color_hex: "#000000", price_override: null, stock: 0, is_active: true,
};

const emptyProduct: ProductForm = {
  name: "", brand: "FIZTOPZ", category: "sarees", category_id: null, section: "ethnic",
  price: 0, old_price: null, stock: 0, sku: "", image: "", images: [], description: "", is_active: true,
  variants: [],
  item: "", fabric: "", work_technique: "", value_edition: "", style: "", 
  length: "5.5 Meter 0.80 Meter Blouse (Unstitched)", 
  width: "44 inch (approximate)", 
  wash_care: "First Wash Dry Clean (Steam or Iron with the cool press)",
  return_window: "7 Days",
  exchange_window: "7 Days",
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getAdminProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const openNew = () => setEditing({ ...emptyProduct });

  const openEdit = (p: any) => {
    let parsedDesc = p.description ?? "";
    let details = { 
      item: "", fabric: "", work_technique: "", value_edition: "", style: "", 
      length: "5.5 Meter 0.80 Meter Blouse (Unstitched)", 
      width: "44 inch (approximate)", 
      wash_care: "First Wash Dry Clean (Steam or Iron with the cool press)",
      return_window: "7 Days",
      _isCustomReturn: false,
      exchange_window: "7 Days",
      _isCustomExchange: false,
    };
    if (parsedDesc.startsWith("{")) {
      try {
        const obj = JSON.parse(parsedDesc);
        if (obj.text !== undefined && obj.details !== undefined) {
          parsedDesc = obj.text;
          details = { ...details, ...obj.details };
        }
      } catch (e) {
        // Not JSON
      }
    }

    setEditing({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      category_id: p.category_id ?? null,
      section: p.section,
      price: Number(p.price),
      old_price: p.old_price ? Number(p.old_price) : null,
      stock: p.stock,
      sku: p.sku ?? "",
      image: p.image ?? "",
      images: p.product_images?.map((pi: any) => pi.url) ?? [],
      description: parsedDesc,
      ...details,
      return_window: details.return_window || "7 Days",
      _isCustomReturn: details.return_window ? !["7 Days", "10 Days", "15 Days", "30 Days", "No Return"].includes(details.return_window) : false,
      exchange_window: details.exchange_window || "7 Days",
      _isCustomExchange: details.exchange_window ? !["7 Days", "10 Days", "15 Days", "30 Days", "No Exchange"].includes(details.exchange_window) : false,
      is_active: p.is_active,
      variants: (p.variants ?? []).map((v: any) => ({
        id: v.id,
        sku: v.sku ?? "",
        size: v.size ?? "",
        color_name: v.color_name ?? "",
        color_hex: v.color_hex ?? "#000000",
        price_override: v.price_override ? Number(v.price_override) : null,
        stock: v.stock,
        is_active: v.is_active,
        images: v.images || [],
      })),
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        brand: editing.brand,
        category: editing.category,
        category_id: editing.category_id,
        section: editing.section,
        price: editing.price,
        old_price: editing.old_price,
        stock: editing.stock,
        sku: editing.sku || null,
        image: editing.image || editing.images?.[0] || null,
        description: JSON.stringify({
          text: editing.description,
          details: {
            item: editing.item,
            fabric: editing.fabric,
            work_technique: editing.work_technique,
            value_edition: editing.value_edition,
            style: editing.style,
            length: editing.length,
            width: editing.width,
            wash_care: editing.wash_care,
            return_window: editing.return_window,
            exchange_window: editing.exchange_window,
          }
        }),
        is_active: editing.is_active,
        images: editing.images,
        variants: editing.variants.map((v) => ({
          sku: v.sku || null,
          size: v.size || null,
          color_name: v.color_name || null,
          color_hex: v.color_hex || null,
          price_override: v.price_override,
          stock: v.stock,
          is_active: v.is_active,
          images: v.images || [],
        })),
      };

      if (editing.id) {
        await updateProduct({ data: { id: editing.id, ...payload } });
      } else {
        await createProduct({ data: payload });
      }

      toast.success(editing.id ? "Product updated" : "Product created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Hide this product? (soft delete)")) return;
    try {
      await deleteProduct({ data: { id } });
      toast.success("Product hidden");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your catalog, stock and pricing.</p>
        </div>
        <button onClick={openNew} className="bg-gold text-white px-5 py-2.5 text-sm font-semibold rounded flex items-center gap-2 hover:bg-gold/90">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <div className="mt-6 bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Image</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-center p-3">Variants</th>
              <th className="text-center p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {(products as any[])?.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  {(p.image || p.product_images?.[0]?.url) && (
                    <img src={p.image || p.product_images[0].url} alt={p.name} className="w-12 h-14 object-cover rounded" />
                  )}
                </td>
                <td className="p-3 font-medium">{p.name}<div className="text-[11px] text-muted-foreground">{p.sku}</div></td>
                <td className="p-3 capitalize">{p.category}</td>
                <td className="p-3 text-right">₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td className="p-3 text-right">
                  <span className={p.stock < 10 ? "text-maroon font-semibold" : ""}>{p.stock}</span>
                </td>
                <td className="p-3 text-center">
                  <span className="text-xs bg-muted px-2 py-1 rounded">{p.variants?.length ?? 0}</span>
                </td>
                <td className="p-3 text-center">
                  <span className={`text-[10px] px-2 py-1 rounded ${p.is_active ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground"}`}>
                    {p.is_active ? "ACTIVE" : "HIDDEN"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 hover:text-gold"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 hover:text-maroon"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {(products as any[])?.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT / CREATE MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-2xl">{editing.id ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <Field label="Name" className="col-span-2"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" /></Field>
              <Field label="Brand"><input value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} className="input" /></Field>
              <Field label="SKU"><input value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} className="input" /></Field>
              <Field label="Category">
                <select
                  value={editing.category_id ?? ""}
                  onChange={(e) => {
                    const cat = (categories as any[]).find((c: any) => c.id === e.target.value);
                    setEditing({
                      ...editing,
                      category_id: cat?.id ?? null,
                      category: cat?.slug ?? editing.category,
                      section: cat?.section ?? editing.section,
                    });
                  }}
                  className="input"
                >
                  <option value="">Select category…</option>
                  {(categories as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Section">
                <select value={editing.section} onChange={(e) => setEditing({ ...editing, section: e.target.value })} className="input">
                  <option value="ethnic">ethnic</option>
                  <option value="western">western</option>
                </select>
              </Field>
              <Field label="Price (₹)"><input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="input" /></Field>
              <Field label="Old Price (₹)"><input type="number" value={editing.old_price ?? ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })} className="input" /></Field>
              <Field label="Stock (base)"><input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="input" /></Field>
              <Field label="Active">
                <select value={editing.is_active ? "1" : "0"} onChange={(e) => setEditing({ ...editing, is_active: e.target.value === "1" })} className="input">
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </Field>

              {/* Cloudinary Image Upload */}
              <Field label="Product Images" className="col-span-2">
                <CloudinaryUpload
                  value={editing.images}
                  onUpload={(url) => setEditing((prev: any) => ({ ...prev, images: [...prev.images, url], image: prev.image || url }))}
                  onRemove={(url) => setEditing((prev: any) => {
                    const nextImages = prev.images.filter((u: string) => u !== url);
                    return {
                      ...prev,
                      images: nextImages,
                      image: prev.image === url ? (nextImages[0] ?? "") : prev.image,
                    };
                  })}
                />
              </Field>

              {/* Fallback: Manual image URL */}
              <Field label="Or paste image URL" className="col-span-2">
                <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="input" placeholder="https://..." />
              </Field>

              <Field label="Description" className="col-span-2"><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input min-h-24" /></Field>

              <div className="col-span-2 font-semibold text-sm mt-4 pb-2 border-b border-border">Product Details</div>
              <Field label="Item"><input value={editing.item} onChange={(e) => setEditing({ ...editing, item: e.target.value })} className="input" /></Field>
              <Field label="Fabric"><input value={editing.fabric} onChange={(e) => setEditing({ ...editing, fabric: e.target.value })} className="input" /></Field>
              <Field label="Technique for Work"><input value={editing.work_technique} onChange={(e) => setEditing({ ...editing, work_technique: e.target.value })} className="input" /></Field>
              <Field label="Technique for value edition"><input value={editing.value_edition} onChange={(e) => setEditing({ ...editing, value_edition: e.target.value })} className="input" /></Field>
              <Field label="Style"><input value={editing.style} onChange={(e) => setEditing({ ...editing, style: e.target.value })} className="input" /></Field>
              <Field label="Length"><input value={editing.length} onChange={(e) => setEditing({ ...editing, length: e.target.value })} className="input" /></Field>
              <Field label="Width"><input value={editing.width} onChange={(e) => setEditing({ ...editing, width: e.target.value })} className="input" /></Field>
              <Field label="Wash Care"><input value={editing.wash_care} onChange={(e) => setEditing({ ...editing, wash_care: e.target.value })} className="input" /></Field>
              <Field label="Return Window">
                <Select
                  value={
                    (editing._isCustomReturn || (!["7 Days", "10 Days", "15 Days", "30 Days", "No Return", ""].includes(editing.return_window)))
                      ? "custom"
                      : editing.return_window
                  }
                  onValueChange={(val) => {
                    if (val === "custom") {
                      setEditing({ ...editing, return_window: "", _isCustomReturn: true });
                    } else {
                      setEditing({ ...editing, return_window: val, _isCustomReturn: false });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Return Window..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 Days">7 Days</SelectItem>
                    <SelectItem value="10 Days">10 Days</SelectItem>
                    <SelectItem value="15 Days">15 Days</SelectItem>
                    <SelectItem value="30 Days">30 Days</SelectItem>
                    <SelectItem value="No Return">No Return</SelectItem>
                    <SelectItem value="custom">Custom Policy...</SelectItem>
                  </SelectContent>
                </Select>
                {(editing._isCustomReturn || (!["7 Days", "10 Days", "15 Days", "30 Days", "No Return", ""].includes(editing.return_window))) && (
                  <input 
                    className="input mt-2" 
                    value={editing.return_window} 
                    onChange={(e) => setEditing({ ...editing, return_window: e.target.value })} 
                    placeholder="Type custom return policy..."
                    autoFocus
                  />
                )}
              </Field>

              <Field label="Exchange Window">
                <Select
                  value={
                    (editing._isCustomExchange || (!["7 Days", "10 Days", "15 Days", "30 Days", "No Exchange", ""].includes(editing.exchange_window)))
                      ? "custom"
                      : editing.exchange_window
                  }
                  onValueChange={(val) => {
                    if (val === "custom") {
                      setEditing({ ...editing, exchange_window: "", _isCustomExchange: true });
                    } else {
                      setEditing({ ...editing, exchange_window: val, _isCustomExchange: false });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Exchange Window..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 Days">7 Days</SelectItem>
                    <SelectItem value="10 Days">10 Days</SelectItem>
                    <SelectItem value="15 Days">15 Days</SelectItem>
                    <SelectItem value="30 Days">30 Days</SelectItem>
                    <SelectItem value="No Exchange">No Exchange</SelectItem>
                    <SelectItem value="custom">Custom Policy...</SelectItem>
                  </SelectContent>
                </Select>
                {(editing._isCustomExchange || (!["7 Days", "10 Days", "15 Days", "30 Days", "No Exchange", ""].includes(editing.exchange_window))) && (
                  <input 
                    className="input mt-2" 
                    value={editing.exchange_window} 
                    onChange={(e) => setEditing({ ...editing, exchange_window: e.target.value })} 
                    placeholder="Type custom exchange policy..."
                    autoFocus
                  />
                )}
              </Field>

              {/* VARIANTS */}
              <div className="col-span-2 border-t border-border pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Product Variants</h3>
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, variants: [...editing.variants, { ...emptyVariant }] })}
                    className="text-xs text-gold font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
                {editing.variants.length === 0 && (
                  <p className="text-xs text-muted-foreground">No variants — stock managed at product level. Add variants for size/color combinations.</p>
                )}
                <div className="space-y-3">
                  {editing.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-6 gap-2 items-end p-3 bg-muted/40 rounded">
                      <Field label="Size"><input value={v.size} onChange={(e) => { const vs = [...editing.variants]; vs[idx] = { ...v, size: e.target.value }; setEditing({ ...editing, variants: vs }); }} className="input" placeholder="M, L, XL…" /></Field>
                      <Field label="Color">
                        <div className="flex gap-1">
                          <input value={v.color_name} onChange={(e) => { const vs = [...editing.variants]; vs[idx] = { ...v, color_name: e.target.value }; setEditing({ ...editing, variants: vs }); }} className="input" placeholder="Red" />
                        </div>
                      </Field>
                      <Field label="Hex">
                        <input type="color" value={v.color_hex} onChange={(e) => { const vs = [...editing.variants]; vs[idx] = { ...v, color_hex: e.target.value }; setEditing({ ...editing, variants: vs }); }} className="w-full h-9 rounded border border-border" />
                      </Field>
                      <Field label="Stock"><input type="number" value={v.stock} onChange={(e) => { const vs = [...editing.variants]; vs[idx] = { ...v, stock: Number(e.target.value) }; setEditing({ ...editing, variants: vs }); }} className="input" /></Field>
                      <Field label="Price Override"><input type="number" value={v.price_override ?? ""} onChange={(e) => { const vs = [...editing.variants]; vs[idx] = { ...v, price_override: e.target.value ? Number(e.target.value) : null }; setEditing({ ...editing, variants: vs }); }} className="input" placeholder="—" /></Field>
                      <div className="flex items-center gap-1 pb-0.5">
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, variants: editing.variants.filter((_, i) => i !== idx) })}
                          className="p-1.5 hover:text-maroon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Variant Images */}
                      <div className="col-span-6 mt-2">
                        <Field label={`${v.color_name || 'Variant'} Images`}>
                          <CloudinaryUpload
                            value={v.images || []}
                            onUpload={(url) => setEditing((prev: any) => {
                              const vs = [...prev.variants];
                              vs[idx] = { ...vs[idx], images: [...(vs[idx].images || []), url] };
                              return { ...prev, variants: vs };
                            })}
                            onRemove={(url) => setEditing((prev: any) => {
                              const vs = [...prev.variants];
                              vs[idx] = { ...vs[idx], images: (vs[idx].images || []).filter((u: string) => u !== url) };
                              return { ...prev, variants: vs };
                            })}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

      <style>{`.input{width:100%;padding:0.6rem 0.75rem;background:transparent;border:1px solid #d1d5db;border-radius:4px;font-size:0.875rem;outline:none}.input:focus{border-color:var(--color-gold,#c9a14a)}`}</style>
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
