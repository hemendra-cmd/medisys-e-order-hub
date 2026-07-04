// Lightweight client-side store using localStorage. UI-only build.
import { useSyncExternalStore } from "react";
import { SEED_PRODUCTS } from "./products-data";

export type Category = "offers" | "rapid-test" | "biochemistry" | "lab-accessories" | "instruments";

export interface Product {
  id: string;
  brand: string;
  name: string;
  packSize: string;
  category: Category;
  isOffer?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  whatsapp: string;
  email: string;
  organisation: string;
}

interface State {
  user: User | null;
  products: Product[];
  cart: CartItem[];
}

const KEY = "medisys.state.v3";

const load = (): State => {
  if (typeof window === "undefined") return { user: null, products: [], cart: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: State = { user: null, products: SEED_PRODUCTS, cart: [] };
  localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
};

let state: State = typeof window !== "undefined" ? load() : { user: null, products: [], cart: [] };
const listeners = new Set<() => void>();

const persist = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useStore = <T,>(selector: (s: State) => T): T =>
  useSyncExternalStore(subscribe, () => selector(state), () => selector(state));

export const actions = {
  signup(u: User) {
    state = { ...state, user: u };
    persist();
  },
  login(email: string) {
    if (!state.user || state.user.email !== email) {
      state = { ...state, user: { whatsapp: "", email, organisation: "Demo Organisation" } };
    }
    persist();
  },
  logout() {
    state = { ...state, user: null };
    persist();
  },
  addToCart(productId: string) {
    const item = state.cart.find((c) => c.productId === productId);
    state = {
      ...state,
      cart: item
        ? state.cart.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c))
        : [...state.cart, { productId, quantity: 1 }],
    };
    persist();
  },
  setQuantity(productId: string, qty: number) {
    state = {
      ...state,
      cart:
        qty <= 0
          ? state.cart.filter((c) => c.productId !== productId)
          : state.cart.map((c) => (c.productId === productId ? { ...c, quantity: qty } : c)),
    };
    persist();
  },
  clearCart() {
    state = { ...state, cart: [] };
    persist();
  },
  upsertProduct(p: Product) {
    const exists = state.products.some((x) => x.id === p.id);
    state = {
      ...state,
      products: exists ? state.products.map((x) => (x.id === p.id ? p : x)) : [...state.products, p],
    };
    persist();
  },
  deleteProduct(id: string) {
    state = { ...state, products: state.products.filter((p) => p.id !== id) };
    persist();
  },
};

export const selectors = {
  cartCount: (s: State) => s.cart.reduce((n, c) => n + c.quantity, 0),
};
