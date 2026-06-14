import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ProductForm from "../../ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) {
    notFound();
  }

  const dbCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    stock: product.stock,
    categoryId: product.categoryId,
    imageUrl: product.images[0] || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Modify product details</p>
      </div>
      <ProductForm categories={dbCategories} initialData={initialData} />
    </div>
  );
}
