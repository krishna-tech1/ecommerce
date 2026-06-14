import React from "react";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const dbCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
        <p className="text-muted-foreground">Create a new product listing</p>
      </div>
      <ProductForm categories={dbCategories} />
    </div>
  );
}
