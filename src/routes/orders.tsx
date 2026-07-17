import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions, useStore, type Order } from "@/lib/store";
import { ArrowLeft, Check, Trash2, PackageCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/orders")({
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
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log(data);

  // TEMPORARY MAPPING
  const mappedOrders: Order[] = (data || []).map((item: any) => ({
    id: item.id,
    organisation: item.organisation,
    contact: item.phone,
    items: [], // we'll load these later
    status:
      item.status === "preparing"
        ? "preparing"
        : "placed",
    createdAt: new Date(item.created_at).getTime(),
  }));

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
            return (
              <div
                key={o.id}
                className={`rounded-lg border bg-card p-4 shadow-card ${preparing ? "border-primary/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          preparing
                            ? "bg-primary/10 text-primary"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {preparing ? <PackageCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {preparing ? "Under preparation" : "Placed"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                      {o.contact && (
                        <span className="text-xs text-muted-foreground">· {o.contact}</span>
                      )}
                    </div>
                    <p className="mt-2 break-words text-sm">
                      <span className="font-semibold">{o.organisation}</span>
                      <span className="text-muted-foreground"> — </span>
                      {o.items.map((i, idx) => (
                        <span key={idx}>
                          {idx > 0 && <span className="text-muted-foreground">, </span>}
                          {i.brand}/{i.name}/{i.packSize}
                          {i.quantity > 1 && <span className="text-muted-foreground"> x{i.quantity}</span>}
                        </span>
                      ))}
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
                        "Mark preparing"
                      )}
                    </label>
                    <button
                      onClick={() => confirm("Delete this order?") && actions.deleteOrder(o.id)}
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
