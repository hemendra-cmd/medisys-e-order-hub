import { supabase } from "./supabase";
import type { Category, Product } from "./store";

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map((item) => ({
    id: String(item.id),
    name: item.name,
    category: item.category as Category,
    brand:
      typeof item.description === "string"
        ? item.description.split(" | ")[0] || ""
        : "",
    packSize:
      typeof item.description === "string"
        ? item.description.split(" | ")[1] || ""
        : "",
    isOffer: item.is_offer ?? false,
  }));
}

export async function addProduct(product: Product) {
  if (!supabase) return;

  const { error } = await supabase.from("products").insert({
    name: product.name,
    category: product.category,
    description: `${product.brand} | ${product.packSize}`,
    price: 0,
    stock: 0,
    image: "",
    is_offer: product.isOffer ?? false,
  });

  if (error) {
    console.error(error);
  }
}

export async function updateProduct(product: Product) {
  if (!supabase) return;

  const { error } = await supabase
    .from("products")
    .update({
      name: product.name,
      category: product.category,
      description: `${product.brand} | ${product.packSize}`,
      is_offer: product.isOffer ?? false,
    })
    .eq("id", product.id);

  if (error) {
    console.error(error);
  }
}

export async function deleteProduct(id: string) {
  if (!supabase) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
  }
}
