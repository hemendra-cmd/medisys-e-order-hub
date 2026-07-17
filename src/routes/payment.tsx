import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions, useStore } from "@/lib/store";
import { CheckCircle2, ArrowLeft, ClipboardList, PackageCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
});

function PaymentPage() {
  const user = useStore((s) => s.user);
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const placedOrder = useStore((s) => s.orders.find((o) => o.id === placedOrderId) ?? null);
  const navigate = useNavigate();

  const items = cart
    .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! }))
    .filter((i) => i.product);
  const totalItems = items.reduce((n, i) => n + i.quantity, 0);

  const placeOrder = async () => {
    const org = user?.organisation ?? "Guest";
    const contact = user?.whatsapp || user?.email || "";
    const orderItems = items.map((i) => ({
      brand: i.product.brand,
      name: i.product.name,
      packSize: i.product.packSize,
      quantity: i.quantity,
    }));
  const placeOrder = async () => {

  const org = user?.organisation ?? "Guest";

  const contact =
    user?.whatsapp ||
    user?.email ||
    "";

  const orderItems = items.map((i) => ({
    brand: i.product.brand,
    name: i.product.name,
    packSize: i.product.packSize,
    quantity: i.quantity,
  }));


const placeOrder = async () => {
    organisation: org,
    contact,
    items: orderItems,
  });


  if (!id) {
    alert("Failed to place order.");
    return;
  }


  actions.clearCart();

  setPlacedOrderId(id);
};

  if (placedOrder) {
    const preparing = placedOrder.status === "preparing";
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${preparing ? "bg-primary/15 text-primary" : "bg-success/15 text-success"}`}>
            {preparing ? <PackageCheck className="h-9 w-9" /> : <CheckCircle2 className="h-9 w-9" />}
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">
            {preparing ? "Order under preparation" : "Order placed"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {preparing
              ? "Your order is being prepared and will be delivered soon."
              : "Thanks — your order has been received. You'll see the status update here as soon as our team starts preparing it."}
          </p>
          {!preparing && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Awaiting confirmation
            </div>
          )}
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Back to catalogue
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Browse products
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <button onClick={() => navigate({ to: "/cart" })} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </button>
        <h1 className="font-display text-2xl font-semibold md:text-3xl">Confirm your order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your items below and tap Place order to submit — our team will confirm and start preparing your order.
        </p>


        <div className="mt-6 rounded-lg border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <ClipboardList className="h-4 w-4 text-primary" /> Order details
          </div>
          <ul className="divide-y">
            {items.map((i) => (
              <li key={i.productId} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <div className="text-xs font-semibold uppercase text-primary">{i.product.brand}</div>
                  <div className="text-sm font-medium">{i.product.name}</div>
                  <div className="text-xs text-muted-foreground">Pack: {i.product.packSize}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-muted-foreground">Qty</div>
                  <div className="font-display text-lg font-semibold">{i.quantity}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">Total items</span>
            <span className="font-display text-lg font-semibold text-primary">{totalItems}</span>
          </div>
        </div>

        <button
          onClick={placeOrder}
          className="mt-6 h-11 w-full rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Place order
        </button>
      </div>

      <SiteFooter />
    </div>
  );
}
