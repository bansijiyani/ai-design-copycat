"use client";


import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getProfile, updateProfile } from "@/lib/api/profile.functions";
import { useAuth } from "@/lib/auth";

import { useQuery } from "@tanstack/react-query";
export default function ProfilePersonalDetails() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: !!user,
  });
  
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile({ data: { full_name: fullName, username } });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded shadow-sm p-6 lg:p-8">
      <h1 className="font-display text-2xl mb-6">Personal Details</h1>
      
      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        <div>
          <label className="block text-xs font-semibold mb-2">Email Address</label>
          <input 
            type="email" 
            value={user?.email || ""} 
            disabled 
            className="w-full px-4 py-3 bg-muted/50 text-muted-foreground border border-border rounded-sm cursor-not-allowed" 
          />
          <p className="text-[10px] text-muted-foreground mt-1">Email address cannot be changed.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2">Full Name</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
            className="w-full px-4 py-3 bg-white border border-border rounded-sm focus:outline-none focus:border-gold transition-colors" 
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2">Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            className="w-full px-4 py-3 bg-white border border-border rounded-sm focus:outline-none focus:border-gold transition-colors" 
          />
        </div>

        <button 
          disabled={busy} 
          type="submit" 
          className="bg-maroon text-white px-6 py-3 text-sm font-semibold tracking-wide rounded-sm hover:bg-maroon/90 transition-colors disabled:opacity-50 mt-4"
        >
          {busy ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </form>
    </div>
  );
}
