import { createFileRoute, Link, redirect, } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions, useStore, type Order } from "@/lib/store";
import { ArrowLeft, Check, Trash2, PackageCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
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

function formatOrder(o: Order) {
  const compact = o.items
    .map((i) => `${i.brand}/${i.name}/${i.packSize}${i.quantity > 1 ? ` x${i.quantity}` : ""}`)
    .join(", ");
  return `${o.organisation} — ${compact}`;
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
 const loadOrders = async () => {

  // Get all orders
  const { data: ordersData, error: ordersError } =
    await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

  if (ordersError) {
    console.error(ordersError);
    return;
  }

  // Get all order items
  const { data: itemsData, error: itemsError } =
    await supabase
      .from("order_items")
      .select("*");

  if (itemsError) {
    console.error(itemsError);
    return;
  }

  const mappedOrders: Order[] = (ordersData || []).map(
    (order: any) => {

      const items = (itemsData || [])
        .filter(
          (item: any) =>
            item.order_id === order.id
        )
        .map((item: any) => ({
          brand: item.brand ?? "",
          name: item.name ?? "",
          packSize: item.pack_size ?? "",
          quantity: item.quantity,
        }));

      return {
        id: order.id,
        organisation: order.organisation,
        contact: order.phone,
        items,
        status:
          order.status === "preparing"
            ? "preparing"
            : "placed",
        createdAt: new Date(
          order.created_at
        ).getTime(),
      };
    }
  );

  setOrders(mappedOrders);
};
  useEffect(() => {
  loadOrders();
}, []);
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold md:text-3xl">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tick an order to mark it as “under preparation”. The customer sees the status update instantly.
            </p>
          </div>
          <Link to="/admin" className="text-sm text-primary hover:underline">Manage products</Link>
        </div>

        <div className="mt-6 space-y-3">
          {orders.length === 0 && (
            <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          )}

           {orders.map((o) => {
  const preparing = o.status === "preparing";

  const totalUnits = o.items.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0,
  );

  return (
    <article
      key={o.id}
      className={`overflow-hidden rounded-xl border bg-card shadow-card ${
        preparing ? "border-primary/40" : ""
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
                {new Date(o.createdAt).toLocaleString(
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
              {o.organisation || "Unknown organisation"}
            </h2>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {o.contact && (
                <span>Contact: {o.contact}</span>
              )}

              <span>
                {o.items.length} products · {totalUnits} units
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Order ID: {o.id}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const nextStatus = preparing
                  ? "placed"
                  : "preparing";

                const { error } = await supabase
                  .from("orders")
                  .update({
                    status: nextStatus,
                  })
                  .eq("id", o.id);

                if (error) {
                  console.error(error);
                  alert("Could not update order status.");
                  return;
                }

                await loadOrders();
              }}
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
              onClick={async () => {
                if (!confirm("Delete this order?")) {
                  return;
                }

                const { error } = await supabase
                  .from("orders")
                  .delete()
                  .eq("id", o.id);

                if (error) {
                  console.error(error);
                  alert("Could not delete the order.");
                  return;
                }

                await loadOrders();
              }}
              className="grid h-10 w-10 place-items-center rounded-md border text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete order"
              title="Delete order"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold">
          Ordered products
        </h3>

        {o.items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No products were found for this order.
          </p>
        ) : (
          <div className="divide-y rounded-lg border">
            {o.items.map((item, index) => (
              <div
                key={`${o.id}-${index}`}
                className="flex items-start justify-between gap-4 p-3 sm:p-4"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {item.brand || "No brand"}
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Pack size: {item.packSize || "Not specified"}
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
        )}

        <details className="mt-4">
          <summary className="cursor-pointer select-none text-xs font-medium text-primary">
            Show copyable order message
          </summary>

          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-secondary p-3 text-xs text-foreground">
            {formatOrder(o)}
          </pre>
        </details>
      </div>
    </article>
  );
})}                
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${
                        preparing ? "border-primary bg-primary/5 text-primary" : "hover:bg-secondary"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={preparing}
                        onChange={(e) =>
                          actions.setOrderStatus(o.id, e.target.checked ? "preparing" : "placed")
                        }
                        className="h-4 w-4 accent-[var(--color-primary)]"
                      />
                      {preparing ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Marked
                        </>
                      ) : (
                        "."
                      )}
                    </label>
                    <button
                     onClick={async () => {
 
                      if (!confirm("Delete this order?")) {
                        return;
                      }

                      const { error } = await supabase
                        .from("orders")
                        .delete()
                        .eq("id", o.id);

                      if (error) {
                        console.error(error);
                        return;
                      }
               
                      loadOrders();
               
                      }}
                    className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
                    aria-label="Delete order"
                   >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <details className="mt-3 text-xs text-muted-foreground">
                  <summary className="cursor-pointer select-none">Copyable message</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-2 text-[11px] text-foreground">
{formatOrder(o)}
                  </pre>
                </details>
              </div>
            );
          })}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
