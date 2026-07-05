import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/site/DashboardHeader";

import { SiteFooter } from "@/components/site/SiteFooter";
import { actions, useStore, type Category, type Product } from "@/lib/store";
import { Minus, Plus, Tag } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const TABS: { id: Category; label: string }[] = [
  { id: "offers", label: "Offers" },
  { id: "rapid-test", label: "Rapid Test" },
  { id: "biochemistry", label: "Biochemistry" },
  { id: "lab-accessories", label: "Lab Accessories" },
  { id: "instruments", label: "Instruments" },
];

function Dashboard() {
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const [tab, setTab] = useState<Category>("offers");
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [packFilter, setPackFilter] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [packSearch, setPackSearch] = useState("");

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const packs = useMemo(() => Array.from(new Set(products.map((p) => p.packSize))).sort(), [products]);

  const visibleBrands = useMemo(
    () => brands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase())),
    [brands, brandSearch],
  );
  const visiblePacks = useMemo(
    () => packs.filter((p) => p.toLowerCase().includes(packSearch.toLowerCase())),
    [packs, packSearch],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return products.filter((p) => {
      // When searching, ignore the active tab so results appear across all categories.
      if (!q) {
        if (tab === "offers" ? !p.isOffer : p.category !== tab) return false;
      }
      if (brandFilter.length && !brandFilter.includes(p.brand)) return false;
      if (packFilter.length && !packFilter.includes(p.packSize)) return false;
      if (q && !`${p.brand} ${p.name} ${p.packSize}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, tab, brandFilter, packFilter, q]);

  const qtyOf = (id: string) => cart.find((c) => c.productId === id)?.quantity ?? 0;

  const toggle = (arr: string[], v: string, set: (n: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="min-h-screen bg-background pb-16">

      <DashboardHeader query={query} onQueryChange={setQuery} />

      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.id === "offers" && <Tag className="mr-1 inline h-3.5 w-3.5" />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="h-fit rounded-lg border bg-card p-4 shadow-card md:sticky md:top-32">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Filters
          </h3>

          <FilterGroup title="Brands">
            {brands.map((b) => (
              <Check
                key={b}
                label={b}
                checked={brandFilter.includes(b)}
                onChange={() => toggle(brandFilter, b, setBrandFilter)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Pack Size">
            {packs.map((p) => (
              <Check
                key={p}
                label={p}
                checked={packFilter.includes(p)}
                onChange={() => toggle(packFilter, p, setPackFilter)}
              />
            ))}
          </FilterGroup>

          {(brandFilter.length > 0 || packFilter.length > 0) && (
            <button
              onClick={() => { setBrandFilter([]); setPackFilter([]); }}
              className="mt-4 w-full rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              Clear filters
            </button>
          )}

          <div className="mt-6 border-t pt-4 text-xs">
            <Link to="/admin" className="text-primary hover:underline">Manage products (Admin)</Link>
          </div>
        </aside>

        {/* Products */}
        <main>
          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
              No products match your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} quantity={qtyOf(p.id)} />
              ))}
            </div>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

function ProductCard({ product, quantity }: { product: Product; quantity: number }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">{product.brand}</span>
          {product.isOffer && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
              Offer
            </span>
          )}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{product.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Pack: {product.packSize}</p>
        <div className="mt-3 flex items-end justify-end">
          {quantity === 0 ? (
            <button
              onClick={() => actions.addToCart(product.id)}
              className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Add to Cart
            </button>
          ) : (
            <QtyControl id={product.id} qty={quantity} />
          )}
        </div>

      </div>
    </div>
  );
}

export function QtyControl({ id, qty }: { id: string; qty: number }) {
  return (
    <div className="inline-flex h-9 items-center rounded-md border">
      <button
        onClick={() => actions.setQuantity(id, qty - 1)}
        className="grid h-full w-8 place-items-center rounded-l-md text-primary hover:bg-accent"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
      <button
        onClick={() => actions.setQuantity(id, qty + 1)}
        className="grid h-full w-8 place-items-center rounded-r-md text-primary hover:bg-accent"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--color-primary)]" />
      <span className={checked ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </label>
  );
}
