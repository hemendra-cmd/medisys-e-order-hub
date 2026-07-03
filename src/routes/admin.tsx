import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardHeader } from "@/components/site/DashboardHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { actions, useStore, type Category, type Product } from "@/lib/store";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const CATS: { id: Category; label: string }[] = [
  { id: "rapid-test", label: "Rapid Test" },
  { id: "biochemistry", label: "Biochemistry" },
  { id: "lab-accessories", label: "Lab Accessories" },
  { id: "instruments", label: "Instruments" },
];

const empty = (): Product => ({
  id: `p${Date.now()}`,
  brand: "",
  name: "",
  packSize: "",
  mrp: 0,
  category: "rapid-test",
  isOffer: false,
});

function AdminPage() {
  const products = useStore((s) => s.products);
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold md:text-3xl">Product catalogue</h1>
            <p className="mt-1 text-sm text-muted-foreground">Add, edit or remove products shown on the store.</p>
          </div>
          <button
            onClick={() => setEditing(empty())}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3">Brand</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Pack</th>
                <th className="p-3">Offer</th>
                <th className="p-3"></th>

              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.brand}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3 text-muted-foreground">{p.packSize}</td>

                  <td className="p-3">{p.isOffer ? "Yes" : "—"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => confirm("Delete this product?") && actions.deleteProduct(p.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ProductDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => { actions.upsertProduct(p); setEditing(null); }}
        />
      )}

      <SiteFooter />
    </div>
  );
}

function ProductDialog({
  initial, onClose, onSave,
}: { initial: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const [p, setP] = useState<Product>(initial);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-semibold">{initial.brand ? "Edit product" : "Add product"}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input label="Brand" value={p.brand} onChange={(v) => setP({ ...p, brand: v })} />
          <Input label="Pack size" value={p.packSize} onChange={(v) => setP({ ...p, packSize: v })} />
          <div className="col-span-2">
            <Input label="Product name" value={p.name} onChange={(v) => setP({ ...p, name: v })} />
          </div>
          <label className="block">

            <span className="mb-1 block text-xs font-medium text-muted-foreground">Category</span>
            <select
              value={p.category}
              onChange={(e) => setP({ ...p, category: e.target.value as Category })}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary/40 focus:ring-2"
            >
              {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!p.isOffer} onChange={(e) => setP({ ...p, isOffer: e.target.checked })} className="h-4 w-4 accent-[var(--color-primary)]" />
            Show in "Offers" tab
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-10 rounded-md border px-4 text-sm hover:bg-secondary">Cancel</button>
          <button
            onClick={() => p.brand && p.name && onSave(p)}
            className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-primary/40 focus:ring-2"
      />
    </label>
  );
}
