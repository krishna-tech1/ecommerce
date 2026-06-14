"use client";

import React, { useActionState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    stock: number;
    categoryId: string | null;
    imageUrl: string;
  };
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await saveProduct(prevState, formData);
      if (result?.success) {
        startTransition(() => {
          router.push("/admin/products");
          router.refresh();
        });
      }
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border">
      {state?.error && (
        <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
          {state.error}
        </div>
      )}

      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={initialData?.name}
          placeholder="e.g. Sony WH-1000XM4"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL identifier)</Label>
        <Input
          id="slug"
          name="slug"
          type="text"
          defaultValue={initialData?.slug}
          placeholder="e.g. sony-wh-1000xm4"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initialData?.categoryId || ""}
          className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={initialData?.price}
            placeholder="e.g. 299.99"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            defaultValue={initialData?.stock}
            placeholder="e.g. 50"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Product Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={initialData?.imageUrl}
          placeholder="e.g. https://images.unsplash.com/photo-..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          placeholder="Detailed description of the product..."
          rows={5}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Product"}
        </Button>
        <Button variant="outline" type="button" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
