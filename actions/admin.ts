"use server";

import { db } from "@/lib/db";
import { products, categories, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth();
  if (session?.user && (session.user as any).role === "admin") {
    return true;
  }
  throw new Error("Unauthorized: Admin role required");
}

export async function deleteProduct(id: string) {
  await verifyAdmin();
  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete product" };
  }
}

export async function saveProduct(prevState: any, formData: FormData) {
  await verifyAdmin();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const stock = Number(formData.get("stock") || "0");
  const categoryId = formData.get("categoryId") as string || null;
  const imageUrl = formData.get("imageUrl") as string;
  const variant = formData.get("variant") as string || "gadget";
  const status = formData.get("status") as string || "normal";

  if (!name || !slug || !price || !imageUrl) {
    return { error: "Name, slug, price, and image URL are required" };
  }

  try {
    const values = {
      name,
      slug,
      description,
      price,
      stock,
      variant,
      status,
      categoryId,
      images: [imageUrl],
    };

    if (id) {
      // Update
      await db.update(products).set(values).where(eq(products.id, id));
    } else {
      // Create
      await db.insert(products).values(values);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save product" };
  }
}

export async function deleteCategory(id: string) {
  await verifyAdmin();
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete category" };
  }
}

export async function saveCategory(prevState: any, formData: FormData) {
  await verifyAdmin();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  if (!name || !slug) {
    return { error: "Name and slug are required" };
  }

  try {
    const values = { name, slug, description };
    if (id) {
      await db.update(categories).set(values).where(eq(categories.id, id));
    } else {
      await db.insert(categories).values(values);
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save category" };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  await verifyAdmin();
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update order status" };
  }
}
