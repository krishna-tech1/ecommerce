import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import PriceFormatter from "@/components/PriceFormatter";
import { deleteProduct } from "@/actions/admin";

export default async function AdminProductsPage() {
  const dbProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your catalog products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No products found. Click &quot;Add Product&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              dbProducts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-slate-950">
                    <div>
                      <p>{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>{p.categoryName || <span className="text-slate-400 font-italic">Uncategorized</span>}</TableCell>
                  <TableCell>
                    <PriceFormatter amount={Number(p.price)} />
                  </TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/products/edit/${p.id}`}>
                          <Edit2 className="h-4 w-4 text-slate-700" />
                        </Link>
                      </Button>
                      <form action={async () => {
                        "use server";
                        await deleteProduct(p.id);
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
