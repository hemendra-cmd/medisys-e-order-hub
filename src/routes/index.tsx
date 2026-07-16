import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions } from "@/lib/store";
import { ShieldCheck, Truck, BadgeCheck, HeartPulse } from "lucide-react";
import bannerImage from "../assets/MEDISYS BANNER.jpeg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent)",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <HeartPulse className="h-3.5 w-3.5" /> Celebrating 17 years of trust
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
              Welcome to <span className="text-primary">Medisys</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Pathological equipment, reagents, rapid tests and lab accessories — ordered in minutes,
              delivered on time, with credit terms for verified labs.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Authentic products from trusted brands</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Same-day dispatch on orders before 4 PM</li>
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> Pay on QR or credit terms</li>
            </ul>
          </div>

          <div className="mx-auto w-full max-w-md">
            <AuthCard />
          </div>
        </div>
      </section>

      <section aria-label="Medisys banner" className="border-y">
        <img
          src={bannerImage}
          alt="Medisys — Celebrating 17 years of trust"
          className="w-full h-auto rounded-xl object-cover"
        />
      </section>

      <section id="about" className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">About Medisys</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Medisys is a leading distributor of diagnostic products across India. We supply pathological
            equipment, reagents, rapid test kits, biochemistry consumables, and lab instruments to
            clinics, hospitals, and independent labs. Our portal is built for procurement teams — fast
            reordering, transparent pricing, and flexible credit for verified businesses.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: "500+", s: "labs served" },
              { t: "2,500+", s: "products" },
              { t: "same day delivery", s: "\n" },
            ].map((x) => (
              <div key={x.t} className="rounded-lg border bg-card p-5 shadow-card">
                <div className="font-display text-3xl font-semibold text-primary whitespace-pre-line">{x.t}</div>
                <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

type Mode = "login" | "signup" | "forgot";

function AuthCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    whatsapp: "",
    email: "",
    organisation: "",
    password: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (!form.whatsapp || !form.password) return setError("WhatsApp number and password are required.");
      actions.signup({
        whatsapp: form.whatsapp,
        email: form.email || `${form.whatsapp}@medisys.local`,
        organisation: form.organisation || "My Organisation",
      });
      navigate({ to: "/dashboard" });
    } else if (mode === "login") {
      if (!form.email || !form.password) return setError("Email and password are required.");
      actions.login(form.email);
      const isAdmin = form.email.trim().toLowerCase().startsWith("medisysone");
      navigate({ to: isAdmin ? "/orders" : "/dashboard" });
    } else {
      if (!otpSent) {
        if (!form.whatsapp) return setError("Enter your WhatsApp number.");
        setOtpSent(true);
        return;
      }
      if (form.otp.length < 4) return setError("Enter the 6-digit OTP.");
      setMode("login");
      setOtpSent(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-elevated">
      <div className="mb-5 flex items-center gap-1 rounded-full bg-secondary p-1 text-sm">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              mode === m ? "bg-background text-foreground shadow-card" : "text-muted-foreground"
            }`}
          >
            {m === "login" ? "Login" : "Sign up"}
          </button>
        ))}
      </div>

      {mode === "forgot" && (
        <div className="mb-4 text-center">
          <h3 className="font-display text-lg font-semibold">Reset password</h3>
          <p className="mt-1 text-xs text-muted-foreground">We'll send an OTP to your WhatsApp number.</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        {mode === "login" && (
          <>
            <Field label="WhatsApp number" value={form.whatsapp} onChange={upd("whatsapp")} placeholder="+91 98xxxxxxxx" />
            <Field label="Email ID" type="email" value={form.email} onChange={upd("email")} placeholder="you@lab.com" />
            <Field label="Organisation name" value={form.organisation} onChange={upd("organisation")} placeholder="City Diagnostics" />
            <Field label="Password" type="password" value={form.password} onChange={upd("password")} placeholder="••••••••" />
          </>
        )}
        {mode === "signup" && (
          <>
            <Field label="WhatsApp number" value={form.whatsapp} onChange={upd("whatsapp")} placeholder="+91 98xxxxxxxx" />
            <Field label="Email ID (optional)" type="email" value={form.email} onChange={upd("email")} placeholder="you@lab.com" />
            <Field label="Organisation name" value={form.organisation} onChange={upd("organisation")} placeholder="City Diagnostics" />
            <Field label="Password" type="password" value={form.password} onChange={upd("password")} placeholder="Create password" />
          </>
        )}
        {mode === "forgot" && !otpSent && (
          <Field label="WhatsApp number" value={form.whatsapp} onChange={upd("whatsapp")} placeholder="+91 98xxxxxxxx" />
        )}
        {mode === "forgot" && otpSent && (
          <>
            <Field label="Enter OTP" value={form.otp} onChange={upd("otp")} placeholder="6-digit code" />
            <Field label="New password" type="password" value={form.password} onChange={upd("password")} placeholder="New password" />
          </>
        )}

        {error && <p className="text-xs text-primary">{error}</p>}

        <button
          type="submit"
          className="mt-2 h-11 w-full rounded-md bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {mode === "login" ? "Login" : mode === "signup" ? "Create account" : otpSent ? "Reset password" : "Send OTP"}
        </button>

        {mode !== "forgot" ? (
          <button
            type="button"
            onClick={() => { setMode("forgot"); setError(""); }}
            className="mx-auto block text-xs text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setMode("login"); setOtpSent(false); setError(""); }}
            className="mx-auto block text-xs text-muted-foreground hover:text-primary"
          >
            Back to login
          </button>
        )}
      </form>
    </div>
  );
}

function Field({
  label, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary/40 focus:ring-2"
      />
    </label>
  );
}
