import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, Mail } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-20">
      <div className="container mx-auto px-4 py-16 grid grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Logo variant="footer" className="h-24 scale-[2.5] origin-left" />
          <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-xs">
            Premium fashion for every occasion. Ethnic roots, western wings — FizTopz dresses India's boldest.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 grid place-items-center border border-white/20 rounded hover:border-gold hover:text-gold transition">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-sm text-white/60">
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@fiztopz.com</p>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] text-white mb-5">COMPANY</h4>
          <ul className="space-y-3 text-sm">
            {["About Us", "Our Story", "Careers", "Press", "Blog"].map((l) => (
              <li key={l}><a href="#" className="hover:text-gold transition">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] text-white mb-5">SHOP</h4>
          <ul className="space-y-3 text-sm">
            {["sarees", "kurtas", "lehengas", "dresses", "co-ords", "denim"].map((c) => (
              <li key={c}>
                <Link to="/products" search={{ category: c }} className="hover:text-gold transition capitalize">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] text-white mb-5">HELP</h4>
          <ul className="space-y-3 text-sm">
            {["Shipping Policy", "Returns & Exchanges", "Size Guide", "Track Your Order", "Contact Us", "FAQs"].map((l) => (
              <li key={l}><a href="#" className="hover:text-gold transition">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 text-xs text-white/50 flex flex-wrap justify-between gap-2">
          <p>© 2026 FizTopz. All rights reserved.</p>
          <p>Designed with care in India.</p>
        </div>
      </div>
    </footer>
  );
}
