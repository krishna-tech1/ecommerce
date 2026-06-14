import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import CategoryForm from "../../CategoryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!category) {
    notFound();
  }

  const initialData = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
        <p className="text-muted-foreground">Modify product category details</p>
      </div>
      <CategoryForm initialData={initialData} />
    </div>
  );
}
