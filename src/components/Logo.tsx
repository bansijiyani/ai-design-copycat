import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "header" | "footer";
}

export function Logo({ className = "h-20 scale-[2.5] origin-left", variant = "header" }: LogoProps) {
  const imgSrc = variant === "header" ? "/header-logo.png" : "/footer-logo.png";
  
  return (
    <Link href="/" className="inline-block shrink-0">
      <img src={imgSrc} alt="FizTopz" className={`w-auto object-contain ${className}`} />
    </Link>
  );
}
