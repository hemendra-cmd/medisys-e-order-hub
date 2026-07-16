import { Link } from "@tanstack/react-router";
import logo from "@/assets/MEDISYS.jpeg";

export function Logo({
  className = "",
  size = 50,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="Medisys home"
    >
      <img
        src={logo}
        alt="Medisys"
        width={size}
        height={size}
        className="rounded-lg object-cover shadow-md"
        style={{
          width: size,
          height: size,
        }}
      />

      <span className="font-display text-2xl font-bold tracking-tight">
        Medi<span className="text-primary">sys</span>
      </span>
    </Link>
  );
}
