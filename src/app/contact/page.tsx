"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { submitContactForm } from "@/lib/api/contact.functions";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitContactForm({ data: formData });
      toast.success("Message sent successfully! We will get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-[#FBF9F6]">
      <Header />
      
      <main className="flex-grow flex flex-col items-center pt-16 pb-24 px-4">
        <h1 className="font-display text-4xl md:text-5xl text-maroon mb-12">Contact Us</h1>
        
        <div className="w-full max-w-2xl bg-white p-8 md:p-12 shadow-sm rounded-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Name Field */}
            <div className="flex flex-col">
              <label htmlFor="name" className="text-xs text-muted-foreground mb-1">Name</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-maroon/30 focus:border-maroon focus:ring-0 px-0 py-2 text-maroon font-medium placeholder-maroon/30 transition-colors"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col">
              <label htmlFor="email" className="text-xs text-muted-foreground mb-1">E-mail</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-maroon/30 focus:border-maroon focus:ring-0 px-0 py-2 text-maroon font-medium placeholder-maroon/30 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Message Field */}
            <div className="flex flex-col">
              <label htmlFor="message" className="text-xs text-muted-foreground mb-1">Message</label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-maroon/30 focus:border-maroon focus:ring-0 px-0 py-2 text-maroon font-medium resize-none transition-colors"
                placeholder="Enter your message"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#643221] text-white tracking-widest text-sm font-semibold py-4 hover:bg-[#50281A] transition-colors disabled:opacity-70 flex justify-center"
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
