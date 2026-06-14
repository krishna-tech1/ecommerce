import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const variant = searchParams.get("variant");
  const minPriceStr = searchParams.get("minPrice") || "0";
  const maxPriceStr = searchParams.get("maxPrice") || "100000";

  const minPrice = Number(minPriceStr);
  const maxPrice = Number(maxPriceStr);

  try {
    let queryConditions = and(
      gte(products.price, minPrice.toString()),
      lte(products.price, maxPrice.toString())
    );

    if (variant) {
      queryConditions = and(queryConditions, eq(products.variant, variant));
    }

    if (category) {
      // Find category ID by slug
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category))
        .limit(1);

      if (cat) {
        queryConditions = and(queryConditions, eq(products.categoryId, cat.id));
      } else {
        // If category is provided but not found, return empty array
        return NextResponse.json([]);
      }
    }

    const res = await db
      .select({
        product: products,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(queryConditions);

    const formatted = res.map(({ product, categoryName }) => ({
      _id: product.id,
      _type: "product",
      name: product.name,
      slug: { current: product.slug },
      description: product.description,
      price: Number(product.price),
      images: product.images,
      stock: product.stock,
      categories: categoryName ? [categoryName] : [],
      createdAt: product.createdAt?.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("API error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
