import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-display ${className}`}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-card">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v16M4 12h16" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Medi<span className="text-primary">sys</span>
      </span>
    </Link>
  );
}
