import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import Title from "@/components/Title";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import React from "react";

const DealPage = async () => {
  // Fetch products with "sale" or "hot" status from DB
  const dealRows = await db
    .select({
      product: products,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.status, "sale"))
    .limit(20);

  const dealProducts = dealRows.map(({ product, categoryName }) => ({
    _id: product.id,
    _type: "product" as const,
    name: product.name,
    slug: { current: product.slug },
    description: product.description,
    price: Number(product.price),
    images: product.images,
    stock: product.stock,
    variant: product.variant,
    status: product.status,
    categories: categoryName ? [categoryName] : [],
    createdAt: product.createdAt?.toISOString(),
  }));

  return (
    <div className="py-10 bg-deal-bg">
      <Container>
        <Title className="mb-5 underline underline-offset-4 decoration-[1px] text-base uppercase tracking-wide">
          Hot Deals of the Week
        </Title>
        {dealProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {dealProducts?.map((product) => (
              <ProductCard key={product?._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-20">
            No deals available right now. Check back soon!
          </p>
        )}
      </Container>
    </div>
  );
};

export default DealPage;
