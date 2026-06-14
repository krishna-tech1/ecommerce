import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { deleteCategory } from "@/actions/admin";

export default async function AdminCategoriesPage() {
  const dbCategories = await db.select().from(categories).orderBy(categories.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your store product categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No categories found. Click &quot;Add Category&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              dbCategories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-slate-950">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{c.description || <span className="text-slate-400">None</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/categories/edit/${c.id}`}>
                          <Edit2 className="h-4 w-4 text-slate-700" />
                        </Link>
                      </Button>
                      <form action={async () => {
                        "use server";
                        await deleteCategory(c.id);
                      }}>
                        <Button variant="destructive" size="icon" type="submit">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
