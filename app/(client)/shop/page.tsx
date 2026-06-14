import Shop from "@/components/Shop";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import React from "react";

const ShopPage = async () => {
  // Fetch all categories from DB for the shop sidebar filter
  const dbCategories = await db.select().from(categories).orderBy(categories.name);

  const formattedCategories = dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? null,
  }));

  return (
    <div>
      <Shop categories={formattedCategories} />
    </div>
  );
};

export default ShopPage;
