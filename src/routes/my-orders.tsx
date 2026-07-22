import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/lib/supabase";
import {
  actions,
  useStore,
  type Order,
} from "@/lib/store";
export const Route = createFileRoute("/my-orders")({
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const user = useStore((state) => state.user);
  const products = useStore((state) => state.products);
  const cart = useStore((state) => state.cart);
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] =
    useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const email =
        user?.email ??
        session?.user?.email ??
        "";

      if (!email) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const {
        data: ordersData,
        error: ordersError,
      } = await supabase
        .from("orders")
        .select("*")
        .eq("email", email)
        .order("created_at", {
          ascending: false,
        });

      if (ordersError) {
        console.error(ordersError);
        setError("Unable to load your orders.");
        setLoading(false);
        return;
      }

      const orderIds = (ordersData ?? []).map(
        (order) => order.id,
      );

      let orderItems: any[] = [];

      if (orderIds.length > 0) {
        const {
          data: itemsData,
          error: itemsError,
        } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        if (itemsError) {
          console.error(itemsError);
        } else {
          orderItems = itemsData ?? [];
        }
      }

      const mappedOrders: Order[] = (
        ordersData ?? []
      ).map((order: any) => ({
        id: order.id,

        organisation:
          order.organisation ??
          order.customer_name ??
          "",

        contact:
          order.phone ??
          order.contact ??
          "",

        status:
          order.status === "preparing"
            ? "preparing"
            : "placed",

        createdAt: new Date(
          order.created_at,
        ).getTime(),

        items: orderItems
          .filter(
            (item: any) =>
              item.order_id === order.id,
          )
          .map((item: any) => ({
            brand: item.brand ?? "",
            name: item.name ?? "",
            packSize:
              item.pack_size ??
              item.packSize ??
              "",
            quantity:
              Number(item.quantity) || 1,
          })),
      }));

      setOrders(mappedOrders);
      setLoading(false);
    };

    void loadOrders();
  }, [user?.email]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId,
    );
  };
const handleOrderAgain = (order: Order) => {
  let found = 0;

  order.items.forEach((orderedItem) => {
    const product = products.find(
      (p) =>
        p.brand.toLowerCase() ===
          orderedItem.brand.toLowerCase() &&
        p.name.toLowerCase() ===
          orderedItem.name.toLowerCase() &&
        p.packSize.toLowerCase() ===
          orderedItem.packSize.toLowerCase(),
    );

    if (!product) return;

    const currentQty =
  cart.find(
    (c) => c.productId === product.id,
  )?.quantity ?? 0;

    actions.setQuantity(
      product.id,
      currentQty + orderedItem.quantity,
    );

    found++;
  });

  if (found === 0) {
    alert(
      "None of these products are available anymore.",
    );
    return;
  }

  navigate({
    to: "/cart",
  });
};
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        query=""
        onQueryChange={() => {}}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              My Orders
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              View your previous Medisys orders.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Continue Shopping
          </Link>
        </div>

        {loading && (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading your orders...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="rounded-lg border bg-card p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />

              <h2 className="mt-4 font-semibold">
                No previous orders
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your completed orders will appear here.
              </p>

              <Link
                to="/dashboard"
                className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Browse Products
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const expanded =
                  expandedOrder === order.id;

                const totalQuantity =
                  order.items.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0,
                  );

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-lg border bg-card shadow-card"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Order placed
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {new Date(
                              order.createdAt,
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Order ID
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-sm font-medium">
                            {order.id}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Items
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {order.items.length} products
                            {" · "}
                            {totalQuantity} units
                          </p>
                        </div>

                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                          {order.status ===
                          "preparing"
                            ? "Preparing"
                            : "Placed"}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleOrder(order.id)
                          }
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                        >
                          {expanded
                            ? "Hide products"
                            : "View products"}

                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                       <button
  type="button"
  onClick={() => handleOrderAgain(order)}
  disabled={order.items.length === 0}
  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
>
  Order Again
</button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t bg-secondary/30 px-4 py-4 sm:px-5">
                        {order.items.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No products were found for
                            this order.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {order.items.map(
                              (item, index) => (
                                <div
                                  key={`${order.id}-${index}`}
                                  className="flex items-start justify-between gap-4 rounded-md border bg-background p-3"
                                >
                                  <div>
                                    <p className="text-xs font-semibold uppercase text-primary">
                                      {item.brand}
                                    </p>

                                    <p className="mt-1 text-sm font-medium">
                                      {item.name}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Pack:{" "}
                                      {item.packSize}
                                    </p>
                                  </div>

                                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                                    Qty {item.quantity}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
      </main>

      <SiteFooter />
    </div>
  );
}
