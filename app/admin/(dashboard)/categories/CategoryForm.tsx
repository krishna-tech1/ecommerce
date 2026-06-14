"use client";

import React, { useActionState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCategory } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await saveCategory(prevState, formData);
      if (result?.success) {
        startTransition(() => {
          router.push("/admin/categories");
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
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={initialData?.name}
          placeholder="e.g. Shoes"
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
          placeholder="e.g. shoes"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          placeholder="Short description of the category..."
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Category"}
        </Button>
        <Button variant="outline" type="button" onClick={() => router.push("/admin/categories")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
