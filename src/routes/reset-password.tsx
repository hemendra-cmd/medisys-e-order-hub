import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    alert("Password updated successfully.");

    navigate({
      to: "/",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow"
      >
        <h1 className="text-2xl font-semibold mb-6">
          Reset Password
        </h1>

        <label className="block mb-4">
          <span className="text-sm">New Password</span>

          <input
            type="password"
            className="mt-1 h-10 w-full rounded border px-3"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">
            Confirm Password
          </span>

          <input
            type="password"
            className="mt-1 h-10 w-full rounded border px-3"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />
        </label>

        {error && (
          <p className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="h-10 w-full rounded bg-primary text-primary-foreground font-semibold"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
