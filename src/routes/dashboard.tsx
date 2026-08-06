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
  ChevronDown,
  Minus,
  Plus,
  Tag,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  actions,
  useStore,
  type Category,
  type Product,
} from "@/lib/store";

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

  const [tab, setTab] =
    useState<Category>("offers");

  const [query, setQuery] =
    useState("");

  const [brandFilter, setBrandFilter] =
    useState<string[]>([]);

  const [packFilter, setPackFilter] =
    useState<string[]>([]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.brand)
          .filter(Boolean),
      ),
    ).sort((first, second) =>
      first.localeCompare(second),
    );
  }, [products]);

  const packs = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.packSize)
          .filter(Boolean),
      ),
    ).sort((first, second) =>
      first.localeCompare(second),
    );
  }, [products]);

  const normalizedQuery =
    query.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
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

      if (normalizedQuery) {
        const searchableText =
          `${product.brand} ${product.name} ${product.packSize}`
            .toLowerCase();

        if (
          !searchableText.includes(
            normalizedQuery,
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    products,
    tab,
    normalizedQuery,
    brandFilter,
    packFilter,
  ]);

  const quantityOf = (
    productId: string,
  ) => {
    return (
      cart.find(
        (item) =>
          item.productId === productId,
      )?.quantity ?? 0
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <DashboardHeader
        query={query}
        onQueryChange={setQuery}
      />

      {/* Product categories */}
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

      {/* Filters */}
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
            {brandFilter.map((brand) => (
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
            ))}

            {packFilter.map((pack) => (
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
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <main className="mx-auto max-w-7xl px-4 pb-10">
        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
            No products match your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={quantityOf(
                    product.id,
                  )}
                />
              ),
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
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
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {product.brand || "No brand"}
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
          Pack:{" "}
          {product.packSize ||
            "Not specified"}
        </p>

        <div className="mt-4 flex items-end justify-end">
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
        aria-label="Decrease quantity"
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
        aria-label="Increase quantity"
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
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [draft, setDraft] =
    useState<string[]>(selected);

  const containerRef =
    useRef<HTMLDivElement>(null);

  const listRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(selected);
      setSearch("");
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
        containerRef.current &&
        !containerRef.current.contains(
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

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, [open]);

  const filteredOptions = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      option
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [options, search]);

  const groupedOptions = useMemo(() => {
    const groups = new Map<
      string,
      string[]
    >();

    for (const option of filteredOptions) {
      const firstCharacter =
        option[0]?.toUpperCase() ?? "#";

      const letter = /[A-Z]/.test(
        firstCharacter,
      )
        ? firstCharacter
        : "#";

      const existing =
        groups.get(letter) ?? [];

      groups.set(letter, [
        ...existing,
        option,
      ]);
    }

    return Array.from(
      groups.entries(),
    ).sort(([first], [second]) =>
      first.localeCompare(second),
    );
  }, [filteredOptions]);

  const availableLetters =
    new Set(
      groupedOptions.map(
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

  const toggleOption = (
    value: string,
  ) => {
    setDraft((current) =>
      current.includes(value)
        ? current.filter(
            (item) => item !== value,
          )
        : [...current, value],
    );
  };

  const jumpToLetter = (
    letter: string,
  ) => {
    const element =
      listRef.current?.querySelector(
        `[data-letter="${letter}"]`,
      );

    if (
      !element ||
      !listRef.current
    ) {
      return;
    }

    listRef.current.scrollTop =
      (
        element as HTMLElement
      ).offsetTop -
      listRef.current.offsetTop;
  };

  const closeWithoutSaving = () => {
    setDraft(selected);
    setOpen(false);
  };

  const applySelection = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
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
              {groupedOptions.length ===
                0 && (
                <p className="p-4 text-center text-xs text-muted-foreground">
                  No matches.
                </p>
              )}

              {groupedOptions.map(
                ([letter, items]) => (
                  <div
                    key={letter}
                    data-letter={letter}
                    className="mb-2"
                  >
                    <div className="sticky top-0 bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {letter}
                    </div>

                    {items.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                      >
                        <input
                          type="checkbox"
                          checked={draft.includes(
                            option,
                          )}
                          onChange={() =>
                            toggleOption(
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
                    ))}
                  </div>
                ),
              )}
            </div>

            <div className="flex flex-col items-center gap-0.5 border-l bg-secondary/40 px-1 py-2 text-[10px] font-semibold text-muted-foreground">
              {alphabet.map((letter) => {
                const available =
                  availableLetters.has(
                    letter,
                  );

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!available}
                    onClick={() =>
                      jumpToLetter(letter)
                    }
                    className={`h-4 w-5 rounded ${
                      available
                        ? "text-foreground hover:bg-primary hover:text-primary-foreground"
                        : "cursor-not-allowed opacity-30"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-2">
            <button
              type="button"
              onClick={closeWithoutSaving}
              className="h-8 rounded-md px-3 text-xs hover:bg-secondary"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={applySelection}
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
