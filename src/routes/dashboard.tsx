import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { actions, useStore, type Category, type Product,  type Order,} from "@/lib/store";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChevronDown, Minus, Plus, Tag, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  const user = useStore((s) => s.user);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [tab, setTab] = useState<Category>("offers");
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [packFilter, setPackFilter] = useState<string[]>([]);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const packs = useMemo(() => Array.from(new Set(products.map((p) => p.packSize))).sort(), [products]);


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
useEffect(() => {
  const loadPreviousOrders = async () => {
    if (!user?.email) {
      setPreviousOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);

    const { data: ordersData, error: ordersError } =
      await supabase
        .from("orders")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });

    if (ordersError) {
      console.error(
        "Failed to load previous orders:",
        ordersError
      );
      setOrdersLoading(false);
      return;
    }

    const orderIds = (ordersData ?? []).map(
      (order) => order.id
    );

    let itemsData: any[] = [];

    if (orderIds.length > 0) {
      const { data, error: itemsError } =
        await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

      if (itemsError) {
        console.error(
          "Failed to load previous order items:",
          itemsError
        );
      } else {
        itemsData = data ?? [];
      }
    }


    const mappedOrders: Order[] = (ordersData ?? []).map(
      (order: any) => ({
        id: order.id,
        organisation: order.organisation ?? "",
        contact: order.phone ?? "",
        status:
          order.status === "preparing"
            ? "preparing"
            : "placed",
        createdAt: new Date(order.created_at).getTime(),
        items: itemsData
          .filter(
            (item: any) =>
              item.order_id === order.id
          )
          .map((item: any) => ({
            brand: item.brand ?? "",
            name: item.name ?? "",
            packSize: item.pack_size ?? "",
            quantity: item.quantity ?? 1,
          })),
      })
    );

    setPreviousOrders(mappedOrders);
    setOrdersLoading(false);
  };

  void loadPreviousOrders();
}, [user?.email]);

  return (
    <div className="min-h-screen bg-background pb-16">

      <DashboardHeader query={query} onQueryChange={setQuery} />

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

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            label="Brand"
            options={brands}
            selected={brandFilter}
            onChange={setBrandFilter}
          />
          <FilterButton
            label="Pack Size"
            options={packs}
            selected={packFilter}
            onChange={setPackFilter}
          />
          {(brandFilter.length > 0 || packFilter.length > 0) && (
            <button
              onClick={() => { setBrandFilter([]); setPackFilter([]); }}
              className="inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
          <div className="ml-auto flex gap-3 text-xs">
            <Link to="/orders" className="text-primary hover:underline">Orders (Admin)</Link>
            <Link to="/admin" className="text-primary hover:underline">Products (Admin)</Link>
          </div>
        </div>

        {(brandFilter.length > 0 || packFilter.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {brandFilter.map((b) => (
              <Chip key={`b-${b}`} label={b} onRemove={() => setBrandFilter(brandFilter.filter((x) => x !== b))} />
            ))}
            {packFilter.map((p) => (
              <Chip key={`p-${p}`} label={p} onRemove={() => setPackFilter(packFilter.filter((x) => x !== p))} />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-6">
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

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label}`} className="rounded-full p-0.5 hover:bg-primary/20">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilterButton({
  label, options, selected, onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) setDraft(selected); }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const o of filtered) {
      const first = o[0]?.toUpperCase() ?? "#";
      const key = /[A-Z]/.test(first) ? first : "#";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const availableLetters = new Set(grouped.map(([l]) => l));
  const ALPHA = ["#", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  const toggle = (v: string) =>
    setDraft(draft.includes(v) ? draft.filter((x) => x !== v) : [...draft, v]);

  const jumpTo = (letter: string) => {
    const el = listRef.current?.querySelector(`[data-letter="${letter}"]`);
    if (el && listRef.current) {
      listRef.current.scrollTop = (el as HTMLElement).offsetTop - listRef.current.offsetTop;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors ${
          selected.length > 0
            ? "border-primary bg-primary/5 text-primary"
            : "hover:bg-secondary"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-lg border bg-card shadow-elevated">
          <div className="border-b p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{label}</h4>
              <button
                onClick={() => setDraft([])}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-40"
                disabled={draft.length === 0}
              >
                Clear
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary/40 focus:ring-2"
            />
          </div>

          <div className="flex max-h-[320px]">
            <div ref={listRef} className="flex-1 overflow-y-auto p-2">
              {grouped.length === 0 && (
                <p className="p-4 text-center text-xs text-muted-foreground">No matches.</p>
              )}
              {grouped.map(([letter, items]) => (
                <div key={letter} data-letter={letter} className="mb-2">
                  <div className="sticky top-0 bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {letter}
                  </div>
                  {items.map((o) => (
                    <label
                      key={o}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={draft.includes(o)}
                        onChange={() => toggle(o)}
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                      <span className={draft.includes(o) ? "font-medium" : ""}>{o}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-0.5 border-l bg-secondary/40 px-1 py-2 text-[10px] font-semibold text-muted-foreground">
              {ALPHA.map((l) => {
                const has = availableLetters.has(l);
                return (
                  <button
                    key={l}
                    disabled={!has}
                    onClick={() => jumpTo(l)}
                    className={`h-4 w-5 rounded ${
                      has ? "text-foreground hover:bg-primary hover:text-primary-foreground" : "opacity-30"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-2">
            <button
              onClick={() => setOpen(false)}
              className="h-8 rounded-md px-3 text-xs hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => { onChange(draft); setOpen(false); }}
              className="h-8 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
