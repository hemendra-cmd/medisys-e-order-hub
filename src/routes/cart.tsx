import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  actions,
  useStore,
  type Product,
} from "@/lib/store";
import {
  Trash2,
  ArrowLeft,
  ShoppingCart,
  History,
} from "lucide-react";
import { QtyControl } from "./dashboard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function normalise(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function CartPage() {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  console.log("CART PRODUCTS:", products);
  console.log("CART ITEMS:", cart);
  const navigate = useNavigate();

  const [frequentProducts, setFrequentProducts] = useState<
    Product[]
  >([]);
  const [loadingFrequent, setLoadingFrequent] =
    useState(true);

  const items = cart
    .map((c) => ({
      ...c,
      product: products.find(
        (p) => p.id === c.productId,
      )!,
    }))
    .filter((i) => i.product);

  const totalItems = items.reduce(
    (n, i) => n + i.quantity,
    0,
  );

  const uniqueLines = items.length;

  useEffect(() => {
    const loadFrequentlyOrdered = async () => {
      setLoadingFrequent(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setFrequentProducts([]);
        setLoadingFrequent(false);
        return;
      }

      const { data: ordersData, error: ordersError } =
        await supabase
          .from("orders")
          .select("id")
          .eq("user_id", session.user.id);

      if (ordersError) {
        console.error(
          "Could not load previous orders:",
          ordersError,
        );
        setLoadingFrequent(false);
        return;
      }

      const orderIds = (ordersData ?? []).map(
        (order) => order.id,
      );

      if (orderIds.length === 0) {
        setFrequentProducts([]);
        setLoadingFrequent(false);
        return;
      }

      const { data: orderItems, error: itemsError } =
        await supabase
          .from("order_items")
          .select(
            "brand, name, pack_size, quantity, order_id",
          )
          .in("order_id", orderIds);

      if (itemsError) {
        console.error(
          "Could not load order items:",
          itemsError,
        );
        setLoadingFrequent(false);
        return;
      }

      const frequency = new Map<string, number>();

      for (const item of orderItems ?? []) {
        const key = [
          normalise(item.brand),
          normalise(item.name),
          normalise(item.pack_size),
        ].join("|");

        const quantity = Number(item.quantity) || 1;

        frequency.set(
          key,
          (frequency.get(key) ?? 0) + quantity,
        );
      }

      const rankedProducts = products
        .map((product) => {
          const key = [
            normalise(product.brand),
            normalise(product.name),
            normalise(product.packSize),
          ].join("|");

          return {
            product,
            frequency: frequency.get(key) ?? 0,
          };
        })
        .filter((entry) => entry.frequency > 0)
        .sort(
          (a, b) => b.frequency - a.frequency,
        )
        .slice(0, 8)
        .map((entry) => entry.product);

      setFrequentProducts(rankedProducts);
      setLoadingFrequent(false);
    };

    loadFrequentlyOrdered();
  }, [products]);

  const addFrequentProduct = (productId: string) => {
    const currentQuantity =
      cart.find(
        (item) => item.productId === productId,
      )?.quantity ?? 0;

    actions.setQuantity(
      productId,
      currentQuantity + 1,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>

        <h1 className="font-display text-2xl font-semibold md:text-3xl">
          Your cart
        </h1>

        {/* Frequently ordered */}
        {(loadingFrequent ||
          frequentProducts.length > 0) && (
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />

              <div>
                <h2 className="font-display text-lg font-semibold">
                  Frequently Ordered
                </h2>

                <p className="text-xs text-muted-foreground">
                  Quickly add products you regularly
                  purchase.
                </p>
              </div>
            </div>

            {loadingFrequent ? (
              <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                Loading frequently ordered products…
              </div>
            ) : (
              <div className="-mx-4 overflow-x-auto px-4 pb-2">
                <div className="grid auto-cols-[calc(50%-0.375rem)] grid-flow-col gap-3 md:auto-cols-[calc(25%-0.5625rem)]">
                  {frequentProducts.map((product) => {
                    const cartQuantity =
                      cart.find(
                        (item) =>
                          item.productId === product.id,
                      )?.quantity ?? 0;

                    return (
                      <article
                        key={product.id}
                        className="flex min-h-48 flex-col rounded-xl border bg-card p-4 shadow-card"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                          {product.brand}
                        </p>

                        <h3 className="mt-1 line-clamp-3 text-sm font-semibold">
                          {product.name}
                        </h3>

                        <p className="mt-2 text-xs text-muted-foreground">
                          Pack: {product.packSize}
                        </p>

                        <div className="mt-auto pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              addFrequentProduct(
                                product.id,
                              )
                            }
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
                          >
                            <ShoppingCart className="h-4 w-4" />

                            {cartQuantity > 0
                              ? `Add Another (${cartQuantity})`
                              : "Add to Cart"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              Your cart is empty.
            </p>

            <Link
              to="/dashboard"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {items.map((i) => (
                <div
                  key={i.productId}
                  className="flex gap-4 rounded-lg border bg-card p-4 shadow-card"
                >
                  <div className="flex flex-1 flex-col">
                    <span className="text-xs font-semibold uppercase text-primary">
                      {i.product.brand}
                    </span>

                    <h3 className="text-sm font-semibold">
                      {i.product.name}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Pack: {i.product.packSize}
                    </p>

                    <div className="mt-auto flex items-end justify-between pt-2">
                      <QtyControl
                        id={i.productId}
                        qty={i.quantity}
                      />

                      <div className="text-right">
                        <div className="text-[10px] uppercase text-muted-foreground">
                          Quantity
                        </div>

                        <div className="font-display text-lg font-semibold">
                          {i.quantity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      actions.setQuantity(
                        i.productId,
                        0,
                      )
                    }
                    className="self-start text-muted-foreground hover:text-primary"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-lg border bg-card p-5 shadow-card md:sticky md:top-24">
              <h3 className="font-display text-lg font-semibold">
                Order summary
              </h3>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Products</dt>
                  <dd>{uniqueLines}</dd>
                </div>

                <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold">
                  <dt>Total items</dt>
                  <dd className="text-primary">
                    {totalItems}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() =>
                  navigate({ to: "/payment" })
                }
                className="mt-5 h-11 w-full rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Place order
              </button>

              <p className="mt-3 text-xs text-muted-foreground">
                Payment is handled separately by our team
                after order confirmation.
              </p>
            </aside>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
