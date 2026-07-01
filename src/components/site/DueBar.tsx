import { selectors, useStore } from "@/lib/store";
import { AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function DueBar() {
  const due = useStore(selectors.dueTotal);
  if (due <= 0) return null;
  return (
    <div className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4" />
          You are due ₹{due.toLocaleString("en-IN")} to Medisys
        </div>
        <Link
          to="/payment"
          className="rounded-md bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/30 hover:bg-white/25"
        >
          Pay now
        </Link>
      </div>
    </div>
  );
}
