import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`font-display text-2xl tracking-tight ${className}`}>
      Fiz<span className="text-gold">Topz</span>
    </Link>
  );
}
