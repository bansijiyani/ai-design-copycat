"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2, Plus, Star, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { getAdminReviews, updateReviewStatus, deleteReview, createAdminReview, getAdminProducts } from "@/lib/api/product.functions";
import { CloudinaryUpload } from "@/components/CloudinaryUpload";

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newReview, setNewReview] = useState({ productId: "", name: "", rating: 5, text: "", images: [] as string[] });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => getAdminReviews(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getAdminProducts(),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => updateReviewStatus({ data: { id, is_approved: true } }),
    onSuccess: () => {
      toast.success("Review approved");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => updateReviewStatus({ data: { id, is_approved: false } }),
    onSuccess: () => {
      toast.success("Review rejected");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => {
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.productId || !newReview.name || !newReview.text) {
      toast.error("Please fill out all required fields.");
      return;
    }
    try {
      await createAdminReview({
        data: {
          productId: newReview.productId,
          reviewerName: newReview.name,
          rating: newReview.rating,
          reviewText: newReview.text,
          images: newReview.images,
        }
      });
      toast.success("Review created successfully!");
      setIsAdding(false);
      setNewReview({ productId: "", name: "", rating: 5, text: "", images: [] });
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create review");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer product reviews.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-gold text-white px-5 py-2.5 text-sm font-semibold rounded flex items-center gap-2 hover:bg-gold/90">
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Reviewer</th>
              <th className="text-left p-3">Rating</th>
              <th className="text-left p-3">Review</th>
              <th className="text-center p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {(reviews as any[]).map((r: any) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3 max-w-[200px]">
                    {r.product?.image && <img src={r.product.image} className="w-10 h-10 object-cover rounded-sm flex-shrink-0" alt="" />}
                    <span className="font-medium truncate">{r.product?.name ?? "Unknown Product"}</span>
                  </div>
                </td>
                <td className="p-3">
                  <p className="font-medium">{r.reviewer_name}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </td>
                <td className="p-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </td>
                <td className="p-3 max-w-[300px]">
                  <p className="truncate" title={r.review_text}>{r.review_text}</p>
                  {r.images?.length > 0 && (
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground mt-1 inline-block">
                      {r.images.length} Image(s)
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {r.is_approved ? (
                    <span className="text-[10px] px-2 py-1 rounded bg-forest/10 text-forest font-semibold">APPROVED</span>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded bg-maroon/10 text-maroon font-semibold">PENDING</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!r.is_approved ? (
                      <button 
                        onClick={() => approveMutation.mutate(r.id)} 
                        className="p-1.5 hover:text-green-600 bg-green-50 rounded" title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => rejectMutation.mutate(r.id)} 
                        className="p-1.5 hover:text-orange-600 bg-orange-50 rounded" title="Hide/Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => { if(confirm('Delete review permanently?')) deleteMutation.mutate(r.id) }} 
                      className="p-1.5 hover:text-maroon bg-red-50 rounded" title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && reviews.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No reviews found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">Add Manual Review</h2>
              <button onClick={() => setIsAdding(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Product</label>
                <select
                  required
                  value={newReview.productId}
                  onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-gold"
                >
                  <option value="">Select a product...</option>
                  {(products as any[]).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-gold"
                  placeholder="e.g. Aditi Patel"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: n })}
                      className={`w-10 h-10 rounded-sm font-semibold border ${newReview.rating === n ? "border-gold bg-gold/10 text-gold" : "border-border hover:border-gold"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Review Text</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Images (Optional)</label>
                <CloudinaryUpload
                  value={newReview.images}
                  onUpload={(url) => setNewReview(prev => ({ ...prev, images: [...prev.images, url] }))}
                  onRemove={(url) => setNewReview(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }))}
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-sm border border-border rounded font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm bg-gold text-white font-semibold rounded">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
