import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { DueBar } from "@/components/site/DueBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions, selectors, useStore } from "@/lib/store";
import { QrCode, Landmark, CheckCircle2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
});

type Method = "qr" | "credit";

function PaymentPage() {
  const total = useStore(selectors.cartTotal);
  const user = useStore((s) => s.user);
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const [method, setMethod] = useState<Method | null>(null);
  const [placed, setPlaced] = useState(false);
  const navigate = useNavigate();

  const placeOrder = () => {
    if (method === "credit") actions.addCredit(total);
    // Simulate admin WhatsApp notification (console)
    const lines = cart.map((c) => {
      const p = products.find((x) => x.id === c.productId);
      return `${p?.name ?? "Item"} (${c.quantity})`;
    });
    console.log(
      `[WhatsApp → admins]\n${user?.organisation ?? "Guest"}:\n${lines.join("\n")}`
    );
    actions.clearCart();
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-background">
        <DueBar />
        <DashboardHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Order placed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {method === "credit"
              ? "We've booked this as a credit order. You'll get WhatsApp and email reminders until it's cleared."
              : "Thank you — your payment has been recorded. A confirmation will reach you on WhatsApp shortly."}
          </p>
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

  return (
    <div className="min-h-screen bg-background">
      <DueBar />
      <DashboardHeader />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <button onClick={() => navigate({ to: "/cart" })} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </button>
        <h1 className="font-display text-2xl font-semibold md:text-3xl">Choose payment method</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Payable amount: <span className="font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span>
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <MethodCard
            active={method === "qr"}
            onClick={() => setMethod("qr")}
            icon={<QrCode className="h-6 w-6" />}
            title="Pay via QR"
            desc="Scan and pay instantly using any UPI app."
          />
          <MethodCard
            active={method === "credit"}
            onClick={() => setMethod("credit")}
            icon={<Landmark className="h-6 w-6" />}
            title="Pay on Credit"
            desc="Place the order now, pay later on agreed terms."
          />
        </div>

        {method === "qr" && (
          <div className="mt-6 rounded-lg border bg-card p-6 text-center shadow-card">
            <h3 className="font-display text-lg font-semibold">Scan to pay</h3>
            <p className="text-sm text-muted-foreground">Amount payable</p>
            <p className="font-display text-3xl font-semibold text-primary">
              ₹{total.toLocaleString("en-IN")}
            </p>
            <div className="mx-auto mt-4 grid h-56 w-56 place-items-center rounded-lg border-2 border-dashed bg-secondary">
              {/* Placeholder QR */}
              <svg viewBox="0 0 100 100" className="h-40 w-40 text-foreground" aria-hidden>
                <rect width="100" height="100" fill="white" />
                {[
                  [0, 0, 30, 30], [70, 0, 30, 30], [0, 70, 30, 30],
                  [10, 10, 10, 10], [80, 10, 10, 10], [10, 80, 10, 10],
                  [40, 40, 8, 8], [50, 40, 8, 8], [40, 50, 8, 8],
                  [60, 50, 8, 8], [70, 60, 8, 8], [40, 70, 8, 8], [55, 75, 8, 8],
                  [80, 40, 8, 8], [80, 55, 8, 8], [42, 20, 6, 6], [58, 20, 6, 6],
                ].map(([x, y, w, h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} fill="currentColor" />
                ))}
              </svg>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">UPI ID: medisys@upi (placeholder)</p>
          </div>
        )}

        {method === "credit" && (
          <div className="mt-6 rounded-lg border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold">Credit order</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A credit invoice will be raised for ₹{total.toLocaleString("en-IN")}. You'll receive weekly reminders on WhatsApp and email until it's cleared.
            </p>
          </div>
        )}

        <button
          disabled={!method || total === 0}
          onClick={placeOrder}
          className="mt-6 h-11 w-full rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {method === "credit" ? "Place credit order" : "I have paid — place order"}
        </button>
      </div>

      <SiteFooter />
    </div>
  );
}

function MethodCard({
  active, onClick, icon, title, desc,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-5 text-left shadow-card transition-all ${
        active ? "border-primary bg-accent ring-2 ring-primary" : "bg-card hover:border-primary/50"
      }`}
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </button>
  );
}
