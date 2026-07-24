import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions } from "@/lib/store";
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  HeartPulse,
  GraduationCap,
  Linkedin,
  Star,
} from "lucide-react";
import bannerImage from "../assets/MEDISYS BANNER.jpeg";
import founderImage from "../assets/founder.jpeg.jpg";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
    <Logo />

    <nav className="flex items-center gap-5">
      <a
        href="#about"
        className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
      >
        About
      </a>

      <a
        href="#why-medisys"
        className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
      >
        Why Medisys
      </a>

      <a
        href="#login"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
      >
        Login
      </a>
    </nav>
  </div>
</header>

<section className="relative overflow-hidden">
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      background:
        "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 38%), radial-gradient(circle at 85% 75%, color-mix(in oklab, var(--color-primary) 8%, transparent), transparent 35%)",
    }}
  />

  <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
    <div className="flex flex-col justify-center">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
        <HeartPulse className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          Trusted for 17+ years
        </span>
      </div>

      <h1 className="mt-8 max-w-2xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
        Diagnostics.
        <br />
        <span className="text-primary">Simplified.</span>
      </h1>

      <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
        Premium diagnostic products, laboratory equipment, rapid test kits
        and consumables supplied with speed, reliability and complete
        transparency.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="group rounded-2xl border bg-background/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">Genuine Products</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Authentic diagnostic products from trusted manufacturers.
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border bg-background/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Truck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Prompt processing and same-day dispatch where available.
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border bg-background/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">Flexible Credit</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Convenient payment options for verified laboratories.
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border bg-background/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <HeartPulse className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">Expert Support</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Dedicated assistance for products and laboratory requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      id="login"
      className="mx-auto w-full max-w-md scroll-mt-28"
    >
      <div className="mb-5 text-center md:text-left">
        <p className="text-sm font-semibold text-primary">
          Medisys Online Ordering
        </p>

        <h2 className="mt-2 font-display text-2xl font-semibold">
          Access your account
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Log in or create an account to browse products and place orders.
        </p>
      </div>

      <AuthCard />

      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Secure access powered by Supabase
      </div>
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
    email: "",
    organisation: "",
    password: "",
    confirmPassword: "",
    otp: "",
});
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (mode === "signup") {
    if (
      !form.organisation ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill all the fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
const { error } = await supabase.auth.signUp({
  email: form.email.trim(),
  password: form.password,
  options: {
    data: {
      organisation_name: form.organisation.trim(),
    },
  },
});

if (error) {
  setError(error.message);
  return;
}

alert(
  "Account created successfully. Please verify your email if required."
);

actions.signup({
  email: form.email.trim().toLowerCase(),
  organisation: form.organisation.trim(),
  whatsapp: "",
});

navigate({ to: "/dashboard" });
return;
  }
if (mode === "login") {
  if (!form.email || !form.password) {
    setError("Email and password are required.");
    return;
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

  if (error) {
    setError(error.message);
    return;
  }

  const user = data.user;

  if (!user) {
    setError("Login succeeded, but user information was not found.");
    return;
  }

  const email = user.email?.toLowerCase() ?? "";

  const adminEmails = [
    "aryanshsaini11@gmail.com",
    "medisysbpl@rediffmail.com",
    "medisysbpl@gmail.com",
  ];

  if (!adminEmails.includes(email)) {
    const { data: customer, error: customerError } =
      await supabase
        .from("customers")
        .select("organisation_name, whatsapp")
        .eq("user_id", user.id)
        .maybeSingle();

    if (customerError) {
      console.error(
        "Failed to load customer profile:",
        customerError
      );
    }

    const organisation =
      customer?.organisation_name?.trim() ||
      String(
        user.user_metadata?.organisation_name ?? ""
      ).trim();

    if (!organisation) {
      setError(
        "Your organisation information could not be found."
      );
      return;
    }

    actions.login(
      email,
      organisation,
      customer?.whatsapp ?? ""
    );
  }

  navigate({
    to: adminEmails.includes(email)
      ? "/orders"
      : "/dashboard",
  });

  return;
}

if (mode === "forgot") {
  if (!form.email) {
    setError("Please enter your email address.");
    return;
  }

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      form.email.trim(),
      {
        redirectTo:
          "https://www.medisysonline.in/reset-password",
      }
    );

  if (error) {
    setError(error.message);
    return;
  }

  alert(
    "Password reset link sent. Please check your email."
  );

  setMode("login");
  return;
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
          <p className="mt-1 text-xs text-muted-foreground">We'll send a password reset link to your email address.</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        {mode === "login" && (
          <>
            <Field label="Email ID" type="email" value={form.email} onChange={upd("email")} placeholder="you@lab.com" />
            <Field label="Password" type="password" value={form.password} onChange={upd("password")} placeholder="••••••••" />
          </>
        )}
        {mode === "signup" && (
          <>
            <Field
              label="Organisation Name"
              value={form.organisation}
              onChange={upd("organisation")}
              placeholder="City Diagnostics"
            />

            <Field
              label="Email Address"
              type="email"
              value={form.email}
              onChange={upd("email")}
              placeholder="you@lab.com"
            />

            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={upd("password")}
              placeholder="Create password"
            />

            <Field
             label="Confirm Password"
             type="password"
             value={form.confirmPassword}
             onChange={upd("confirmPassword")}
             placeholder="Confirm password"
            />
          </>
       )}
        {mode === "forgot" && !otpSent && (
          <Field
            label="Email Address"
            type="email"
            value={form.email}
            onChange={upd("email")}
            placeholder="you@lab.com"
         />
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
