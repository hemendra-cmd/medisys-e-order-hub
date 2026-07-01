import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { DueBar } from "@/components/site/DueBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions, selectors, useStore } from "@/lib/store";
import { Trash2, ArrowLeft } from "lucide-react";
import { QtyControl } from "./dashboard";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const total = useStore(selectors.cartTotal);
  const navigate = useNavigate();

  const items = cart
    .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! }))
    .filter((i) => i.product);

  return (
    <div className="min-h-screen bg-background">
      <DueBar />
      <DashboardHeader />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <h1 className="font-display text-2xl font-semibold md:text-3xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-card p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/dashboard" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.productId} className="flex gap-4 rounded-lg border bg-card p-4 shadow-card">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-accent">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary/70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 3h6v4l5 8v6H4v-6l5-8V3z" />
                    </svg>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-xs font-semibold uppercase text-primary">{i.product.brand}</span>
                    <h3 className="text-sm font-semibold">{i.product.name}</h3>
                    <p className="text-xs text-muted-foreground">Pack: {i.product.packSize}</p>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <QtyControl id={i.productId} qty={i.quantity} />
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-muted-foreground">Item total</div>
                        <div className="font-display text-lg font-semibold">
                          ₹{(i.product.mrp * i.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => actions.setQuantity(i.productId, 0)}
                    className="self-start text-muted-foreground hover:text-primary"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-lg border bg-card p-5 shadow-card md:sticky md:top-24">
              <h3 className="font-display text-lg font-semibold">Order summary</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Items</dt>
                  <dd>{items.reduce((n, i) => n + i.quantity, 0)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd>₹{total.toLocaleString("en-IN")}</dd>
                </div>
                <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="text-primary">₹{total.toLocaleString("en-IN")}</dd>
                </div>
              </dl>
              <button
                onClick={() => navigate({ to: "/payment" })}
                className="mt-5 h-11 w-full rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Proceed to payment
              </button>
            </aside>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
