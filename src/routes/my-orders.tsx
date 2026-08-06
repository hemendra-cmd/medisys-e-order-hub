import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Package,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/lib/supabase";
import {
  actions,
  useStore,
  type AvailabilityStatus,
  type Order,
  type OrderItem,
} from "@/lib/store";

export const Route = createFileRoute("/my-orders")({
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const user = useStore((state) => state.user);
  const products = useStore(
    (state) => state.products,
  );
  const cart = useStore((state) => state.cart);

  const navigate = useNavigate();

  const [orders, setOrders] =
    useState<Order[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [
    expandedOrder,
    setExpandedOrder,
  ] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const email = (
      user?.email ??
      session?.user?.email ??
      ""
    )
      .trim()
      .toLowerCase();

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
      console.error(
        "Unable to load orders:",
        ordersError,
      );

      setError(
        "Unable to load your orders. Please try again.",
      );
      setLoading(false);
      return;
    }

    const orderIds = (
      ordersData ?? []
    ).map((order) => order.id);

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
        console.error(
          "Unable to load order items:",
          itemsError,
        );

        setError(
          "Your orders were found, but the product details could not be loaded.",
        );
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
          id: item.id,
          brand: item.brand ?? "",
          name: item.name ?? "",
          packSize:
            item.pack_size ??
            item.packSize ??
            "",
          quantity:
            Number(item.quantity) || 1,
          availabilityStatus:
            (item.availability_status ??
              "pending") as AvailabilityStatus,
        })),
    }));

    setOrders(mappedOrders);
    setLoading(false);
  };

  useEffect(() => {
    void loadOrders();
  }, [user?.email]);

  const toggleOrder = (
    orderId: string,
  ) => {
    setExpandedOrder((current) =>
      current === orderId
        ? null
        : orderId,
    );
  };

  const handleOrderAgain = (
    order: Order,
  ) => {
    let foundProducts = 0;

    order.items.forEach(
      (orderedItem) => {
        const matchingProduct =
          products.find(
            (product) =>
              product.brand
                .trim()
                .toLowerCase() ===
                orderedItem.brand
                  .trim()
                  .toLowerCase() &&
              product.name
                .trim()
                .toLowerCase() ===
                orderedItem.name
                  .trim()
                  .toLowerCase() &&
              product.packSize
                .trim()
                .toLowerCase() ===
                orderedItem.packSize
                  .trim()
                  .toLowerCase(),
          );

        if (!matchingProduct) {
          return;
        }

        const currentQuantity =
          cart.find(
            (cartItem) =>
              cartItem.productId ===
              matchingProduct.id,
          )?.quantity ?? 0;

        actions.setQuantity(
          matchingProduct.id,
          currentQuantity +
            orderedItem.quantity,
        );

        foundProducts += 1;
      },
    );

    if (foundProducts === 0) {
      alert(
        "None of these products are currently available in the catalogue.",
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
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Customer Account
            </p>

            <h1 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
              My Orders
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Track product availability and
              review your previous Medisys
              orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void loadOrders()
              }
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-secondary"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading your orders...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="rounded-xl border bg-card p-10 text-center">
              <Package className="mx-auto h-11 w-11 text-muted-foreground" />

              <h2 className="mt-4 text-lg font-semibold">
                No previous orders
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Orders placed using this
                account will appear here.
              </p>

              <Link
                to="/dashboard"
                className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Browse Products
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order) => (
                <CustomerOrderCard
                  key={order.id}
                  order={order}
                  expanded={
                    expandedOrder ===
                    order.id
                  }
                  onToggle={() =>
                    toggleOrder(order.id)
                  }
                  onOrderAgain={() =>
                    handleOrderAgain(order)
                  }
                />
              ))}
            </div>
          )}
      </main>

      <SiteFooter />
    </div>
  );
}

function CustomerOrderCard({
  order,
  expanded,
  onToggle,
  onOrderAgain,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onOrderAgain: () => void;
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
        "These products are planned for the next purchase or supply cycle.",
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
        "Our team is still checking availability for these products.",
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

  const totalQuantity =
    order.items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 1),
      0,
    );

  const availableCount =
    groups[0].items.length;

  const awaitedCount =
    groups[1].items.length;

  const nextOrderCount =
    groups[2].items.length;

  const pendingCount =
    groups[3].items.length;

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
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

              <h2 className="mt-3 break-words text-base font-semibold">
                Order #{order.id}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {order.items.length} products
                · {totalQuantity} units
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusCount
                label="Available"
                count={availableCount}
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              {expanded
                ? "Hide product status"
                : "View product status"}

              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onOrderAgain}
              disabled={
                order.items.length === 0
              }
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Order Again
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t bg-secondary/20 p-4 sm:p-5">
          {order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No products were found for
              this order.
            </p>
          ) : (
            groups.map((group) => {
              if (
                group.items.length === 0
              ) {
                return null;
              }

              return (
                <AvailabilityGroup
                  key={group.status}
                  title={group.title}
                  description={
                    group.description
                  }
                  items={group.items}
                  containerClass={
                    group.containerClass
                  }
                  badgeClass={
                    group.badgeClass
                  }
                  orderId={order.id}
                  status={group.status}
                />
              );
            })
          )}
        </div>
      )}
    </article>
  );
}
function AvailabilityGroup({
  title,
  description,
  items,
  containerClass,
  badgeClass,
  orderId,
  status,
}: {
  title: string;
  description: string;
  items: OrderItem[];
  containerClass: string;
  badgeClass: string;
  orderId: string;
  status: AvailabilityStatus;
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border ${containerClass}`}
    >
      <div className="flex flex-col gap-3 border-b border-current/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {items.length}{" "}
          {items.length === 1
            ? "product"
            : "products"}
        </span>
      </div>

      <div className="divide-y">
        {items.map((item, index) => (
          <div
            key={
              item.id ??
              `${orderId}-${status}-${index}`
            }
            className="flex items-start justify-between gap-4 bg-card/85 p-4"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {item.brand || "No brand"}
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
        ))}
      </div>
    </section>
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
