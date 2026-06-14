import CategoryProducts from "@/components/CategoryProducts";
import Container from "@/components/Container";
import Title from "@/components/Title";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import React from "react";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const dbCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

  const formattedCategories = dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? null,
  }));

  return (
    <div className="py-10">
      <Container>
        <Title>
          Products by Category:{" "}
          <span className="font-bold text-green-600 capitalize tracking-wide">
            {slug && slug}
          </span>
        </Title>
        <CategoryProducts categories={formattedCategories} slug={slug} />
      </Container>
    </div>
  );
};

export default CategoryPage;
