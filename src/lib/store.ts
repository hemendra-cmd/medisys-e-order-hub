// Lightweight client-side store using localStorage. UI-only build.
import { useSyncExternalStore } from "react";
import { SEED_PRODUCTS } from "./products-data";
import { supabase, isSupabaseConfigured } from "./supabase";

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

export type OrderStatus = "placed" | "preparing";

export interface OrderItem {
  brand: string;
  name: string;
  packSize: string;
  quantity: number;
}

export interface Order {
  id: string;
  organisation: string;
  contact: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
}

interface State {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
}

const KEY = "medisys.state.v4";

const empty = (): State => ({ user: null, products: [], cart: [], orders: [] });

const normalizeCategory = (value: unknown): Category => {
  const categories = [
    "offers",
    "rapid-test",
    "biochemistry",
    "lab-accessories",
    "instruments",
  ];

  return categories.includes(String(value))
    ? (value as Category)
    : "rapid-test";
};

const mapSupabaseProduct = (
  item: Record<string, unknown>
): Product | null => {
  const name = typeof item.name === "string" ? item.name : "";

  if (!name) return null;

  const description =
    typeof item.description === "string"
      ? item.description
      : "";

  const [brand = "", packSize = ""] =
    description.split(" | ");

  return {
    id: String(item.id),
    name,
    brand,
    packSize,
    category: normalizeCategory(item.category),
    isOffer: Boolean(item.is_offer),
  };
};

const load = (): State => {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      return { ...empty(), ...parsed, orders: parsed.orders ?? [] };
    }
  } catch {}
  const initial: State = { ...empty(), products: SEED_PRODUCTS };
  localStorage.setItem(KEY, JSON.stringify(initial));
  return initial;
};

let state: State = typeof window !== "undefined" ? load() : empty();

const hydrateProductsFromSupabase = async () => {
 if (
    typeof window === "undefined" ||
    !isSupabaseConfigured ||
    !supabase
  ) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, description, is_offer")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const products = (data ?? [])
      .map((item) =>
        mapSupabaseProduct(item as Record<string, unknown>)
      )
      .filter((item): item is Product => item !== null);

    if (products.length > 0) {
      state = {
        ...state,
        products,
      };

      persist();
    }
  } catch (error) {
    console.error(
      "Failed to load products from Supabase",
      error
    );
  }
};
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  void hydrateProductsFromSupabase();
}

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
  login(email: string, organisation: string, whatsapp = "") {
  state = {
    ...state,
    user: {
      email,
      organisation: organisation.trim(),
      whatsapp: whatsapp.trim(),
    },
  };

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
  const exists = state.cart.some(
    (item) => item.productId === productId
  );

  state = {
    ...state,
    cart:
      qty <= 0
        ? state.cart.filter(
            (item) => item.productId !== productId
          )
        : exists
          ? state.cart.map((item) =>
              item.productId === productId
                ? { ...item, quantity: qty }
                : item
            )
          : [
              ...state.cart,
              {
                productId,
                quantity: qty,
              },
            ],
  };

  persist();
},

clearCart() {
  state = {
    ...state,
    cart: [],
  };

  persist();
},

async upsertProduct(p: Product) {

async upsertProduct(p: Product) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("products")
      .upsert({
        id: p.id,
        name: p.name,
        category: p.category,
        description: `${p.brand} | ${p.packSize}`,
        price: 0,
        stock: 0,
        image: "",
        is_offer: p.isOffer ?? false,
      });

    if (error) {
      console.error("Failed to save product:", error);
      return;
    }

    await hydrateProductsFromSupabase();
    return;
  }

  const exists = state.products.some(
    (x) => x.id === p.id
  );

  state = {
    ...state,
    products: exists
      ? state.products.map((x) =>
          x.id === p.id ? p : x
        )
      : [...state.products, p],
  };

  persist();
},
  async deleteProduct(id: string) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete product:", error);
      return;
    }

    await hydrateProductsFromSupabase();
    return;
  }

  state = {
    ...state,
    products: state.products.filter((p) => p.id !== id),
  };

  persist();
},
  async addOrder(
  o: Omit<Order, "id" | "createdAt" | "status">
): Promise<string> {

  const id = `o${Date.now()}`;

  const order: Order = {
    ...o,
    id,
    createdAt: Date.now(),
    status: "placed",
  };

  // LOCAL STORAGE
  state = {
    ...state,
    orders: [order, ...state.orders],
  };
  persist();

  // SUPABASE
  if (isSupabaseConfigured && supabase) {
    const totalQuantity = order.items.reduce(
     (sum, item) => sum + item.quantity,
      0
    );

    // STEP 1 - Insert into orders table
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: order.organisation,
        organisation: order.organisation,
        phone: order.contact,
        email: state.user?.email ?? "",
        address: "",
        city: "",
        total: 0,
        status: order.status,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save order:", error);
      return "";
    }

    // STEP 2 - Get the UUID generated by Supabase
    const orderId = data.id;

    // STEP 3 - Insert all products into order_items
    for (const item of order.items) {

      const product = state.products.find(
        (p) =>
          p.name === item.name &&
          p.brand === item.brand
      );

      if (!product) continue;

      const { error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderId,
          product_id: product.id,
          quantity: item.quantity,
          price: 0,
          brand: item.brand,
          name: item.name,
          pack_size: item.packSize,
        });

      if (itemError) {
        console.error(
          "Failed to save order item:",
          itemError
        );
      }
    }
  }

  return id;
},
  setOrderStatus(id: string, status: OrderStatus) {
    state = {
      ...state,
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    };
    persist();
  },
  deleteOrder(id: string) {
    state = { ...state, orders: state.orders.filter((o) => o.id !== id) };
    persist();
  },
};

export const selectors = {
  cartCount: (s: State) => s.cart.reduce((n, c) => n + c.quantity, 0),
};
