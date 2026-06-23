import { Link } from "@tanstack/react-router";

interface LogoProps {
  className?: string;
  variant?: "header" | "footer";
}

export function Logo({ className = "h-20 scale-[2.5] origin-left", variant = "header" }: LogoProps) {
  const imgSrc = variant === "header" ? "/header-logo.png" : "/footer-logo.png";
  
  return (
    <Link to="/" className="inline-block shrink-0">
      <img src={imgSrc} alt="FizTopz" className={`w-auto object-contain ${className}`} />
    </Link>
  );
}
