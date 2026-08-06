import {
  createFileRoute,
  Link,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  PackageCheck,
  Trash2,
} from "lucide-react";

import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import type {
  AvailabilityStatus,
  Order,
} from "@/lib/store";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = [
  "aryanshsaini11@gmail.com",
  "medisysbpl@rediffmail.com",
  "medisysbpl@gmail.com",
];

export const Route = createFileRoute("/orders")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const email =
      session?.user?.email?.toLowerCase() ?? "";

    if (!session || !ADMIN_EMAILS.includes(email)) {
      throw redirect({
        to: "/",
      });
    }
  },

  component: OrdersPage,
});

function formatOrder(order: Order) {
  const compact = order.items
    .map(
      (item) =>
        `${item.brand}/${item.name}/${item.packSize}${
          item.quantity > 1
            ? ` x${item.quantity}`
            : ""
        }`,
    )
    .join(", ");

  return `${order.organisation} — ${compact}`;
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] =
    useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);

    const {
      data: ordersData,
      error: ordersError,
    } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (ordersError) {
      console.error(
        "Failed to load orders:",
        ordersError,
      );
      setLoading(false);
      return;
    }

    const {
      data: itemsData,
      error: itemsError,
    } = await supabase
      .from("order_items")
      .select("*");

    if (itemsError) {
      console.error(
        "Failed to load order items:",
        itemsError,
      );
      setLoading(false);
      return;
    }

    const mappedOrders: Order[] = (
      ordersData ?? []
    ).map((order: any) => {
      const items = (itemsData ?? [])
        .filter(
          (item: any) =>
            item.order_id === order.id,
        )
        .map((item: any) => ({
          id: item.id,
          brand: item.brand ?? "",
          name: item.name ?? "",
          packSize: item.pack_size ?? "",
          quantity: item.quantity ?? 1,
          availabilityStatus:
            (item.availability_status ??
              "pending") as AvailabilityStatus,
        }));

      return {
        id: order.id,
        organisation:
          order.organisation ?? "",
        contact: order.phone ?? "",
        items,
        status:
          order.status === "preparing"
            ? "preparing"
            : "placed",
        createdAt: new Date(
          order.created_at,
        ).getTime(),
      };
    });

    setOrders(mappedOrders);
    setLoading(false);
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const updateItemAvailability = async (
    itemId: string | undefined,
    status: AvailabilityStatus,
  ) => {
    if (!itemId) {
      alert(
        "This order item could not be identified.",
      );
      return;
    }

    setUpdatingItemId(itemId);

    const { error } = await supabase
      .from("order_items")
      .update({
        availability_status: status,
      })
      .eq("id", itemId);

    if (error) {
      console.error(
        "Could not update product availability:",
        error,
      );
      alert(
        "Could not update product availability.",
      );
      setUpdatingItemId(null);
      return;
    }

    await loadOrders();
    setUpdatingItemId(null);
  };

  const updateOrderStatus = async (
    orderId: string,
    currentStatus: Order["status"],
  ) => {
    const nextStatus =
      currentStatus === "preparing"
        ? "placed"
        : "preparing";

    const { error } = await supabase
      .from("orders")
      .update({
        status: nextStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.error(
        "Could not update order status:",
        error,
      );
      alert(
        "Could not update order status.",
      );
      return;
    }

    await loadOrders();
  };

  const deleteOrder = async (
    orderId: string,
  ) => {
    if (!confirm("Delete this order?")) {
      return;
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error(
        "Could not delete order:",
        error,
      );
      alert("Could not delete the order.");
      return;
    }

    await loadOrders();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold md:text-3xl">
              Orders
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Review each product and mark it as
              available, awaited, or next order.
              Customers will see the updated status.
            </p>
          </div>

          <Link
            to="/admin"
            className="text-sm text-primary hover:underline"
          >
            Manage products
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {loading && (
            <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
              Loading orders...
            </div>
          )}

          {!loading &&
            orders.length === 0 && (
              <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                No orders yet.
              </div>
            )}

          {!loading &&
            orders.map((order) => {
              const preparing =
                order.status === "preparing";

              const totalUnits =
                order.items.reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      item.quantity || 1,
                    ),
                  0,
                );

              const availableCount =
                order.items.filter(
                  (item) =>
                    item.availabilityStatus ===
                    "available",
                ).length;

              const awaitedCount =
                order.items.filter(
                  (item) =>
                    item.availabilityStatus ===
                    "awaited",
                ).length;

              const nextOrderCount =
                order.items.filter(
                  (item) =>
                    item.availabilityStatus ===
                    "next_order",
                ).length;

              const pendingCount =
                order.items.filter(
                  (item) =>
                    !item.availabilityStatus ||
                    item.availabilityStatus ===
                      "pending",
                ).length;

              return (
                <article
                  key={order.id}
                  className={`overflow-hidden rounded-xl border bg-card shadow-card ${
                    preparing
                      ? "border-primary/40"
                      : ""
                  }`}
                >
                  {/* Order header */}
                  <div className="border-b bg-secondary/20 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              preparing
                                ? "bg-primary/10 text-primary"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {preparing ? (
                              <PackageCheck className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}

                            {preparing
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

                        <h2 className="mt-3 break-words text-lg font-semibold">
                          {order.organisation ||
                            "Unknown organisation"}
                        </h2>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {order.contact && (
                            <span>
                              Contact:{" "}
                              {order.contact}
                            </span>
                          )}

                          <span>
                            {order.items.length}{" "}
                            products · {totalUnits}{" "}
                            units
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Order ID: {order.id}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              order.status,
                            )
                          }
                          className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold ${
                            preparing
                              ? "border-primary bg-primary/10 text-primary"
                              : "hover:bg-secondary"
                          }`}
                        >
                          {preparing && (
                            <Check className="h-4 w-4" />
                          )}

                          {preparing
                            ? "Marked Preparing"
                            : "Mark Preparing"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteOrder(order.id)
                          }
                          className="grid h-10 w-10 place-items-center rounded-md border text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete order"
                          title="Delete order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Availability summary */}
                    {order.items.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Available:{" "}
                          {availableCount}
                        </span>

                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Awaited: {awaitedCount}
                        </span>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          Next order:{" "}
                          {nextOrderCount}
                        </span>

                        <span className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                          Pending: {pendingCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div className="p-4 sm:p-5">
                    <h3 className="mb-3 text-sm font-semibold">
                      Ordered products
                    </h3>

                    {order.items.length ===
                    0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        No products were found for
                        this order.
                      </p>
                    ) : (
                      <div className="divide-y rounded-lg border">
                        {order.items.map(
                          (item, index) => {
                            const itemUpdating =
                              updatingItemId ===
                              item.id;

                            return (
                              <div
                                key={
                                  item.id ??
                                  `${order.id}-${index}`
                                }
                                className="flex flex-col gap-4 p-3 sm:p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
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
                                      {item.quantity ||
                                        1}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Product availability
                                  </p>

                                  <div className="flex flex-wrap gap-2">
                                    <AvailabilityButton
                                      label="Available"
                                      status="available"
                                      currentStatus={
                                        item.availabilityStatus ??
                                        "pending"
                                      }
                                      activeClass="border-green-300 bg-green-50 text-green-700"
                                      disabled={
                                        itemUpdating ||
                                        !item.id
                                      }
                                      onClick={() =>
                                        updateItemAvailability(
                                          item.id,
                                          "available",
                                        )
                                      }
                                    />

                                    <AvailabilityButton
                                      label="Awaited"
                                      status="awaited"
                                      currentStatus={
                                        item.availabilityStatus ??
                                        "pending"
                                      }
                                      activeClass="border-amber-300 bg-amber-50 text-amber-700"
                                      disabled={
                                        itemUpdating ||
                                        !item.id
                                      }
                                      onClick={() =>
                                        updateItemAvailability(
                                          item.id,
                                          "awaited",
                                        )
                                      }
                                    />

                                    <AvailabilityButton
                                      label="Next Order"
                                      status="next_order"
                                      currentStatus={
                                        item.availabilityStatus ??
                                        "pending"
                                      }
                                      activeClass="border-blue-300 bg-blue-50 text-blue-700"
                                      disabled={
                                        itemUpdating ||
                                        !item.id
                                      }
                                      onClick={() =>
                                        updateItemAvailability(
                                          item.id,
                                          "next_order",
                                        )
                                      }
                                    />

                                    <AvailabilityButton
                                      label="Pending"
                                      status="pending"
                                      currentStatus={
                                        item.availabilityStatus ??
                                        "pending"
                                      }
                                      activeClass="border-gray-300 bg-gray-100 text-gray-700"
                                      disabled={
                                        itemUpdating ||
                                        !item.id
                                      }
                                      onClick={() =>
                                        updateItemAvailability(
                                          item.id,
                                          "pending",
                                        )
                                      }
                                    />
                                  </div>

                                  {itemUpdating && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      Saving status...
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}

                    <details className="mt-4">
                      <summary className="cursor-pointer select-none text-xs font-medium text-primary">
                        Show copyable order
                        message
                      </summary>

                      <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-secondary p-3 text-xs text-foreground">
                        {formatOrder(order)}
                      </pre>
                    </details>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function AvailabilityButton({
  label,
  status,
  currentStatus,
  activeClass,
  disabled,
  onClick,
}: {
  label: string;
  status: AvailabilityStatus;
  currentStatus: AvailabilityStatus;
  activeClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const active = currentStatus === status;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? activeClass
          : "bg-background text-muted-foreground hover:bg-secondary"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {active && (
        <Check className="mr-1.5 h-3.5 w-3.5" />
      )}

      {label}
    </button>
  );
}
