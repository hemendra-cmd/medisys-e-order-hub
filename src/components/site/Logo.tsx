import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/MEDISYS.jpeg";

export function Logo({ className = "", size = 36 }: { className?: string; size?: number }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Medisys home">
      <img
        src={logoAsset.url}
        alt="Medisys"
        width={size}
        height={size}
        className="rounded-md object-cover shadow-card"
        style={{ width: size, height: size }}
      />
      <span className="font-display text-lg font-semibold tracking-tight">
        Medi<span className="text-primary">sys</span>
      </span>
    </Link>
  );
}
