import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Minus,
  PackageOpen,
  Plus,
  RotateCcw,
  Tag,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  actions,
  useStore,
  type AvailabilityStatus,
  type Category,
  type Order,
  type OrderItem,
  type Product,
} from "@/lib/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const TABS: {
  id: Category;
  label: string;
}[] = [
  {
    id: "offers",
    label: "Offers",
  },
  {
    id: "rapid-test",
    label: "Rapid Test",
  },
  {
    id: "biochemistry",
    label: "Biochemistry",
  },
  {
    id: "lab-accessories",
    label: "Lab Accessories",
  },
  {
    id: "instruments",
    label: "Instruments",
  },
];

function Dashboard() {
  const products = useStore(
    (state) => state.products,
  );
  const cart = useStore(
    (state) => state.cart,
  );
  const user = useStore(
    (state) => state.user,
  );

  const [previousOrders, setPreviousOrders] =
    useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] =
    useState(true);

  const [tab, setTab] =
    useState<Category>("offers");
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] =
    useState<string[]>([]);
  const [packFilter, setPackFilter] =
    useState<string[]>([]);

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.brand)
            .filter(Boolean),
        ),
      ).sort(),
    [products],
  );

  const packs = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.packSize)
            .filter(Boolean),
        ),
      ).sort(),
    [products],
  );

  const normalizedQuery =
    query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (!normalizedQuery) {
        if (
          tab === "offers"
            ? !product.isOffer
            : product.category !== tab
        ) {
          return false;
        }
      }

      if (
        brandFilter.length > 0 &&
        !brandFilter.includes(product.brand)
      ) {
        return false;
      }

      if (
        packFilter.length > 0 &&
        !packFilter.includes(product.packSize)
      ) {
        return false;
      }

      if (
        normalizedQuery &&
        !`${product.brand} ${product.name} ${product.packSize}`
          .toLowerCase()
          .includes(normalizedQuery)
      ) {
        return false;
      }

      return true;
    });
  }, [
    products,
    tab,
    brandFilter,
    packFilter,
    normalizedQuery,
  ]);

  const qtyOf = (id: string) =>
    cart.find(
      (item) => item.productId === id,
    )?.quantity ?? 0;

  const loadPreviousOrders = async () => {
    if (!user?.email) {
      setPreviousOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);

    const {
      data: ordersData,
      error: ordersError,
    } = await supabase
      .from("orders")
      .select("*")
      .eq(
        "email",
        user.email.trim().toLowerCase(),
      )
      .order("created_at", {
        ascending: false,
      });

    if (ordersError) {
      console.error(
        "Failed to load previous orders:",
        ordersError,
      );
      setPreviousOrders([]);
      setOrdersLoading(false);
      return;
    }

    const orderIds = (
      ordersData ?? []
    ).map((order) => order.id);

    let itemsData: any[] = [];

    if (orderIds.length > 0) {
      const {
        data,
        error: itemsError,
      } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) {
        console.error(
          "Failed to load previous order items:",
          itemsError,
        );
      } else {
        itemsData = data ?? [];
      }
    }

    const mappedOrders: Order[] = (
      ordersData ?? []
    ).map((order: any) => ({
      id: order.id,
      organisation:
        order.organisation ?? "",
      contact: order.phone ?? "",
      status:
        order.status === "preparing"
          ? "preparing"
          : "placed",
      createdAt: new Date(
        order.created_at,
      ).getTime(),
      items: itemsData
        .filter(
          (item: any) =>
            item.order_id === order.id,
        )
        .map((item: any) => ({
          id: item.id,
          brand: item.brand ?? "",
          name: item.name ?? "",
          packSize:
            item.pack_size ?? "",
          quantity:
            item.quantity ?? 1,
          availabilityStatus:
            (item.availability_status ??
              "pending") as AvailabilityStatus,
        })),
    }));

    setPreviousOrders(mappedOrders);
    setOrdersLoading(false);
  };

  useEffect(() => {
    void loadPreviousOrders();
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <DashboardHeader
        query={query}
        onQueryChange={setQuery}
      />

      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
          {TABS.map((currentTab) => (
            <button
              key={currentTab.id}
              type="button"
              onClick={() =>
                setTab(currentTab.id)
              }
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === currentTab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {currentTab.id ===
                "offers" && (
                <Tag className="mr-1 inline h-3.5 w-3.5" />
              )}

              {currentTab.label}
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

          {(brandFilter.length > 0 ||
            packFilter.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setBrandFilter([]);
                setPackFilter([]);
              }}
              className="inline-flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}

          <div className="ml-auto flex gap-3 text-xs">
            <Link
              to="/orders"
              className="text-primary hover:underline"
            >
              Orders (Admin)
            </Link>

            <Link
              to="/admin"
              className="text-primary hover:underline"
            >
              Products (Admin)
            </Link>
          </div>
        </div>

        {(brandFilter.length > 0 ||
          packFilter.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {brandFilter.map(
              (brand) => (
                <Chip
                  key={`brand-${brand}`}
                  label={brand}
                  onRemove={() =>
                    setBrandFilter(
                      brandFilter.filter(
                        (item) =>
                          item !== brand,
                      ),
                    )
                  }
                />
              ),
            )}

            {packFilter.map(
              (pack) => (
                <Chip
                  key={`pack-${pack}`}
                  label={pack}
                  onRemove={() =>
                    setPackFilter(
                      packFilter.filter(
                        (item) =>
                          item !== pack,
                      ),
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10">
        <main>
          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
              No products match your
              filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={qtyOf(
                      product.id,
                    )}
                  />
                ),
              )}
            </div>
          )}
        </main>
      </div>

      <section className="border-y bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Order Updates
              </p>

              <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                My Previous Orders
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review which products are
                available now, awaited, planned
                for your next order, or still
                pending confirmation.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadPreviousOrders()
              }
              disabled={ordersLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw
                className={`h-4 w-4 ${
                  ordersLoading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>

          <div className="mt-8">
            {ordersLoading ? (
              <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
                Loading your orders...
              </div>
            ) : previousOrders.length ===
              0 ? (
              <div className="rounded-xl border bg-card p-10 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 font-semibold">
                  No previous orders
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Orders placed using your
                  account will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {previousOrders.map(
                  (order) => (
                    <CustomerOrderCard
                      key={order.id}
                      order={order}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function CustomerOrderCard({
  order,
}: {
  order: Order;
}) {
  const groups: {
    status: AvailabilityStatus;
    title: string;
    description: string;
    items: OrderItem[];
    containerClass: string;
    badgeClass: string;
  }[] = [
    {
      status: "available",
      title: "Available Now",
      description:
        "These products are confirmed and can be prepared.",
      items: order.items.filter(
        (item) =>
          item.availabilityStatus ===
          "available",
      ),
      containerClass:
        "border-green-200 bg-green-50/60",
      badgeClass:
        "bg-green-100 text-green-700",
    },
    {
      status: "awaited",
      title: "Awaited",
      description:
        "These products are currently unavailable and are being awaited.",
      items: order.items.filter(
        (item) =>
          item.availabilityStatus ===
          "awaited",
      ),
      containerClass:
        "border-amber-200 bg-amber-50/60",
      badgeClass:
        "bg-amber-100 text-amber-700",
    },
    {
      status: "next_order",
      title: "Next Order",
      description:
        "These products may be included in your next purchase cycle.",
      items: order.items.filter(
        (item) =>
          item.availabilityStatus ===
          "next_order",
      ),
      containerClass:
        "border-blue-200 bg-blue-50/60",
      badgeClass:
        "bg-blue-100 text-blue-700",
    },
    {
      status: "pending",
      title: "Pending Confirmation",
      description:
        "Our team is checking availability for these products.",
      items: order.items.filter(
        (item) =>
          !item.availabilityStatus ||
          item.availabilityStatus ===
            "pending",
      ),
      containerClass:
        "border-border bg-background",
      badgeClass:
        "bg-secondary text-muted-foreground",
    },
  ];

  const confirmedCount =
    groups[0].items.length;
  const awaitedCount =
    groups[1].items.length;
  const nextOrderCount =
    groups[2].items.length;
  const pendingCount =
    groups[3].items.length;

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className="border-b bg-secondary/20 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  order.status ===
                  "preparing"
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.status ===
                "preparing" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Clock3 className="h-3.5 w-3.5" />
                )}

                {order.status ===
                "preparing"
                  ? "Under preparation"
                  : "Order placed"}
              </span>

              <span className="text-xs text-muted-foreground">
                {new Date(
                  order.createdAt,
                ).toLocaleString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )}
              </span>
            </div>

            <h3 className="mt-3 font-semibold">
              Order #{order.id}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {order.items.length} products
              in this order
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusCount
              label="Available"
              count={confirmedCount}
              className="border-green-200 bg-green-50 text-green-700"
            />

            <StatusCount
              label="Awaited"
              count={awaitedCount}
              className="border-amber-200 bg-amber-50 text-amber-700"
            />

            <StatusCount
              label="Next"
              count={nextOrderCount}
              className="border-blue-200 bg-blue-50 text-blue-700"
            />

            <StatusCount
              label="Pending"
              count={pendingCount}
              className="border-border bg-background text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {groups.map((group) => {
          if (group.items.length === 0) {
            return null;
          }

          return (
            <section
              key={group.status}
              className={`overflow-hidden rounded-lg border ${group.containerClass}`}
            >
              <div className="flex flex-col gap-2 border-b border-current/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold">
                    {group.title}
                  </h4>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {group.description}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${group.badgeClass}`}
                >
                  {group.items.length}{" "}
                  {group.items.length === 1
                    ? "product"
                    : "products"}
                </span>
              </div>

              <div className="divide-y">
                {group.items.map(
                  (item, index) => (
                    <div
                      key={
                        item.id ??
                        `${order.id}-${group.status}-${index}`
                      }
                      className="flex items-start justify-between gap-4 bg-card/80 p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {item.brand ||
                            "No brand"}
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Pack size:{" "}
                          {item.packSize ||
                            "Not specified"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">
                          Quantity
                        </p>

                        <span className="mt-1 inline-flex min-w-10 justify-center rounded-full bg-secondary px-3 py-1 text-sm font-bold">
                          {item.quantity || 1}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
}

function StatusCount({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}: {count}
    </span>
  );
}
function ProductCard({
  product,
  quantity,
}: {
  product: Product;
  quantity: number;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {product.brand}
          </span>

          {product.isOffer && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
              Offer
            </span>
          )}
        </div>

        <h3 className="mt-1 line-clamp-2 text-sm font-semibold">
          {product.name}
        </h3>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Pack: {product.packSize}
        </p>

        <div className="mt-3 flex items-end justify-end">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() =>
                actions.addToCart(
                  product.id,
                )
              }
              className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Add to Cart
            </button>
          ) : (
            <QtyControl
              id={product.id}
              qty={quantity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function QtyControl({
  id,
  qty,
}: {
  id: string;
  qty: number;
}) {
  return (
    <div className="inline-flex h-9 items-center rounded-md border">
      <button
        type="button"
        onClick={() =>
          actions.setQuantity(
            id,
            qty - 1,
          )
        }
        className="grid h-full w-8 place-items-center rounded-l-md text-primary hover:bg-accent"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className="w-8 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>

      <button
        type="button"
        onClick={() =>
          actions.setQuantity(
            id,
            qty + 1,
          )
        }
        className="grid h-full w-8 place-items-center rounded-r-md text-primary hover:bg-accent"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="rounded-full p-0.5 hover:bg-primary/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilterButton({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (
    next: string[],
  ) => void;
}) {
  const [open, setOpen] =
    useState(false);
  const [search, setSearch] =
    useState("");
  const [draft, setDraft] =
    useState<string[]>(selected);

  const ref =
    useRef<HTMLDivElement>(null);
  const listRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(selected);
    }
  }, [open, selected]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        ref.current &&
        !ref.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
  }, [open]);

  const filteredOptions =
    useMemo(
      () =>
        options.filter((option) =>
          option
            .toLowerCase()
            .includes(
              search.toLowerCase(),
            ),
        ),
      [options, search],
    );

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      string[]
    >();

    for (const option of filteredOptions) {
      const first =
        option[0]?.toUpperCase() ??
        "#";

      const key = /[A-Z]/.test(
        first,
      )
        ? first
        : "#";

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(option);
    }

    return Array.from(
      map.entries(),
    ).sort(([first], [second]) =>
      first.localeCompare(second),
    );
  }, [filteredOptions]);

  const availableLetters =
    new Set(
      grouped.map(
        ([letter]) => letter,
      ),
    );

  const alphabet = [
    "#",
    ...Array.from(
      {
        length: 26,
      },
      (_, index) =>
        String.fromCharCode(
          65 + index,
        ),
    ),
  ];

  const toggle = (
    value: string,
  ) => {
    setDraft(
      draft.includes(value)
        ? draft.filter(
            (item) =>
              item !== value,
          )
        : [...draft, value],
    );
  };

  const jumpTo = (
    letter: string,
  ) => {
    const element =
      listRef.current?.querySelector(
        `[data-letter="${letter}"]`,
      );

    if (
      element &&
      listRef.current
    ) {
      listRef.current.scrollTop =
        (
          element as HTMLElement
        ).offsetTop -
        listRef.current.offsetTop;
    }
  };

  return (
    <div
      className="relative"
      ref={ref}
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
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

        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-lg border bg-card shadow-elevated">
          <div className="border-b p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {label}
              </h4>

              <button
                type="button"
                onClick={() =>
                  setDraft([])
                }
                disabled={
                  draft.length === 0
                }
                className="text-xs font-medium text-primary hover:underline disabled:opacity-40"
              >
                Clear
              </button>
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder={`Search ${label.toLowerCase()}…`}
              className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary/40 focus:ring-2"
            />
          </div>

          <div className="flex max-h-[320px]">
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2"
            >
              {grouped.length === 0 && (
                <p className="p-4 text-center text-xs text-muted-foreground">
                  No matches.
                </p>
              )}

              {grouped.map(
                ([
                  letter,
                  items,
                ]) => (
                  <div
                    key={letter}
                    data-letter={letter}
                    className="mb-2"
                  >
                    <div className="sticky top-0 bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {letter}
                    </div>

                    {items.map(
                      (option) => (
                        <label
                          key={
                            option
                          }
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                        >
                          <input
                            type="checkbox"
                            checked={draft.includes(
                              option,
                            )}
                            onChange={() =>
                              toggle(
                                option,
                              )
                            }
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />

                          <span
                            className={
                              draft.includes(
                                option,
                              )
                                ? "font-medium"
                                : ""
                            }
                          >
                            {option}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                ),
              )}
            </div>

            <div className="flex flex-col items-center gap-0.5 border-l bg-secondary/40 px-1 py-2 text-[10px] font-semibold text-muted-foreground">
              {alphabet.map(
                (letter) => {
                  const available =
                    availableLetters.has(
                      letter,
                    );

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={
                        !available
                      }
                      onClick={() =>
                        jumpTo(
                          letter,
                        )
                      }
                      className={`h-4 w-5 rounded ${
                        available
                          ? "text-foreground hover:bg-primary hover:text-primary-foreground"
                          : "opacity-30"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-2">
            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="h-8 rounded-md px-3 text-xs hover:bg-secondary"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
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
