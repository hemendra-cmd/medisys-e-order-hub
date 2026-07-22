import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingCart,
  LogOut,
  UserRound,
} from "lucide-react";
import { Logo } from "./Logo";
import { selectors, useStore, actions } from "@/lib/store";

interface Props {
  query?: string;
  onQueryChange?: (v: string) => void;
}

export function DashboardHeader({ query, onQueryChange }: Props) {
  const cartCount = useStore(selectors.cartCount);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
        <Logo />
        <div className="relative ml-auto flex-1 md:mx-6 md:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query ?? ""}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Search products, brands, kits…"
            className="h-10 w-full rounded-full border bg-secondary pl-10 pr-4 text-sm outline-none ring-primary/40 focus:bg-background focus:ring-2"
          />
        </div>
        <Link
           to="/my-orders"
           aria-label="My Orders"
           title="My Orders"
          className="inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-secondary sm:px-3"
         >
  <UserRound className="h-5 w-5" />

  <span className="hidden sm:inline">
    My Orders
  </span>
</Link>
        <Link
          to="/cart"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {cartCount}
            </span>
          )}
        </Link>
        <button
          onClick={() => {
            actions.logout();
            navigate({ to: "/" });
          }}
          className="hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary md:inline-flex"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
