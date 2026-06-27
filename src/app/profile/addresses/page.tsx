"use client";


import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, MapPin, Check } from "lucide-react";
import { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/lib/api/address.functions";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
export default function ProfileAddresses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => getMyAddresses(),
    enabled: !!user,
  });
  const [editing, setEditing] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing.id) {
        await updateAddress({ data: editing });
        toast.success("Address updated!");
      } else {
        await createAddress({ data: editing });
        toast.success("Address added!");
      }
      setEditing(null);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress({ data: { id } });
      toast.success("Address deleted.");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress({ data: { id } });
      toast.success("Default address updated!");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update default.");
    }
  };

  return (
    <div className="bg-white border border-border rounded shadow-sm p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl">Manage Addresses</h1>
        <button 
          onClick={() => setEditing({ label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", is_default: false })}
          className="flex items-center gap-2 text-sm font-semibold bg-maroon text-white px-4 py-2 rounded-sm hover:bg-maroon/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded border border-dashed border-border">
          <MapPin className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">You haven't saved any addresses yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`border rounded p-4 relative ${addr.is_default ? 'border-maroon bg-maroon/5' : 'border-border'}`}>
              {addr.is_default && (
                <span className="absolute top-4 right-4 text-[10px] font-bold bg-maroon text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> DEFAULT
                </span>
              )}
              <h3 className="font-semibold">{addr.full_name} <span className="text-xs text-muted-foreground font-normal ml-2 px-1.5 py-0.5 bg-muted rounded">{addr.label}</span></h3>
              <p className="text-sm mt-2">{addr.line1}</p>
              {addr.line2 && <p className="text-sm">{addr.line2}</p>}
              <p className="text-sm">{addr.city}, {addr.state} {addr.pincode}</p>
              <p className="text-sm">{addr.country}</p>
              <p className="text-sm mt-1">Phone: {addr.phone}</p>
              
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                <button onClick={() => setEditing(addr)} className="text-xs font-semibold text-gold hover:underline flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <div className="w-px h-3 bg-border"></div>
                <button onClick={() => handleDelete(addr.id)} className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
                {!addr.is_default && (
                  <>
                    <div className="w-px h-3 bg-border"></div>
                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-semibold text-foreground hover:underline">
                      Set Default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl mb-4">{editing.id ? "Edit Address" : "Add New Address"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Label (e.g. Home, Work)</label>
                  <input required value={editing.label} onChange={e => setEditing({...editing, label: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input required value={editing.full_name} onChange={e => setEditing({...editing, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number</label>
                <input value={editing.phone || ""} onChange={e => setEditing({...editing, phone: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address Line 1</label>
                <input required value={editing.line1} onChange={e => setEditing({...editing, line1: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address Line 2 (Optional)</label>
                <input value={editing.line2 || ""} onChange={e => setEditing({...editing, line2: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">City</label>
                  <input required value={editing.city} onChange={e => setEditing({...editing, city: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">State</label>
                  <input required value={editing.state} onChange={e => setEditing({...editing, state: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Pincode</label>
                  <input required value={editing.pincode} onChange={e => setEditing({...editing, pincode: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Country</label>
                  <input required value={editing.country} onChange={e => setEditing({...editing, country: e.target.value})} className="w-full px-3 py-2 border rounded-sm focus:outline-none focus:border-gold" />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_default} onChange={e => setEditing({...editing, is_default: e.target.checked})} className="accent-gold w-4 h-4" />
                <span className="text-sm">Make this my default address</span>
              </label>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground">Cancel</button>
                <button disabled={busy} type="submit" className="bg-maroon text-white px-6 py-2 text-sm font-semibold rounded-sm hover:bg-maroon/90 disabled:opacity-50">
                  {busy ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
