// Lightweight client-side store using localStorage. UI-only build.
import { useSyncExternalStore } from "react";

export type Category = "offers" | "rapid-test" | "biochemistry" | "lab-accessories" | "instruments";

export interface Product {
  id: string;
  brand: string;
  name: string;
  packSize: string;
  mrp: number;
  category: Category;
  isOffer?: boolean;
  image?: string;
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

export interface CreditOrder {
  id: string;
  amount: number;
  createdAt: number;
  paid: boolean;
}

interface State {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  credits: CreditOrder[];
}

const KEY = "medisys.state.v1";

const CATEGORIES: Category[] = ["rapid-test", "biochemistry", "lab-accessories", "instruments"];
const seedProducts = (): Product[] => {
  const brands = ["Roche", "Abbott", "BioRad", "Thermo", "Mindray", "Siemens", "Erba", "Tulip"];
  const packs = ["25 tests", "50 tests", "100 tests", "500 ml", "1 L", "10 x 5 ml"];
  const namesByCat: Record<Category, string[]> = {
    "rapid-test": ["Dengue NS1 Rapid Test", "Malaria Pf/Pv Kit", "HIV 1&2 Kit", "COVID-19 Antigen", "Typhoid IgM"],
    biochemistry: ["Glucose Reagent", "Creatinine Kit", "Lipid Profile", "SGOT/SGPT", "Urea Reagent"],
    "lab-accessories": ["Micropipette Tips", "Cuvettes 10mm", "Test Tubes 5ml", "Nitrile Gloves M", "EDTA Vials"],
    instruments: ["Semi Auto Analyser", "Centrifuge 4000rpm", "ELISA Reader", "Incubator 37C", "Micropipette 100-1000µl"],
    offers: [],
  };
  const products: Product[] = [];
  let i = 0;
  for (const cat of CATEGORIES) {
    for (const name of namesByCat[cat]) {
      const brand = brands[i % brands.length];
      const packSize = packs[i % packs.length];
      const mrp = Math.round((cat === "instruments" ? 25000 : 500) * (1 + (i % 7) * 0.3));
      products.push({
        id: `p${i + 1}`,
        brand,
        name,
        packSize,
        mrp,
        category: cat,
        isOffer: i % 4 === 0,
      });
      i++;
    }
  }
  return products;
};

const load = (): State => {
  if (typeof window === "undefined") return { user: null, products: [], cart: [], credits: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: State = { user: null, products: seedProducts(), cart: [], credits: [] };
  localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
};

let state: State = typeof window !== "undefined" ? load() : { user: null, products: [], cart: [], credits: [] };
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

// --- actions
export const actions = {
  signup(u: User) {
    state = { ...state, user: u };
    persist();
  },
  login(email: string) {
    // stub: create session if missing user by email
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
  addCredit(amount: number) {
    state = {
      ...state,
      credits: [...state.credits, { id: `c${Date.now()}`, amount, createdAt: Date.now(), paid: false }],
    };
    persist();
  },
  clearCredits() {
    state = { ...state, credits: state.credits.map((c) => ({ ...c, paid: true })) };
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
  cartTotal: (s: State) =>
    s.cart.reduce((sum, item) => {
      const p = s.products.find((x) => x.id === item.productId);
      return sum + (p ? p.mrp * item.quantity : 0);
    }, 0),
  cartCount: (s: State) => s.cart.reduce((n, c) => n + c.quantity, 0),
  dueTotal: (s: State) => s.credits.filter((c) => !c.paid).reduce((n, c) => n + c.amount, 0),
};
