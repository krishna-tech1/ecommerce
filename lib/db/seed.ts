import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

async function seed() {
  console.log("Seeding started...");

  // Clear existing data (optional, but good for clean start)
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.products);
  await db.delete(schema.categories);

  // Insert Categories
  const [catElectronics] = await db
    .insert(schema.categories)
    .values({
      name: "Electronics",
      slug: "electronics",
      description: "Phones, Laptops, Accessories, and gadgets",
    })
    .returning();

  const [catFashion] = await db
    .insert(schema.categories)
    .values({
      name: "Fashion & Apparel",
      slug: "fashion",
      description: "Trending clothes, jackets, shoes, and bags",
    })
    .returning();

  const [catHome] = await db
    .insert(schema.categories)
    .values({
      name: "Home & Living",
      slug: "home-living",
      description: "Furniture, kitchenware, and home decor",
    })
    .returning();

  console.log("Categories seeded!");

  // Insert Products
  await db.insert(schema.products).values([
    // Electronics
    {
      name: "Pro Headphones Max",
      slug: "pro-headphones-max",
      description: "Noise cancelling premium over-ear headphones with 40h battery life.",
      price: "299.99",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop"],
      stock: 50,
      variant: "gadget",
      status: "hot",
      categoryId: catElectronics.id,
    },
    {
      name: "Vibrant Smartwatch S2",
      slug: "vibrant-smartwatch-s2",
      description: "Fitness tracking, heart rate monitor, AMOLED display, 7-day battery life.",
      price: "149.50",
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop"],
      stock: 120,
      variant: "gadget",
      status: "normal",
      categoryId: catElectronics.id,
    },
    {
      name: "Ultra Slim Mechanical Keyboard",
      slug: "ultra-slim-keyboard",
      description: "Wireless mechanical keyboard with RGB backlighting and tactile brown switches.",
      price: "89.99",
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop"],
      stock: 80,
      variant: "gadget",
      status: "sale",
      categoryId: catElectronics.id,
    },
    // Fashion
    {
      name: "Premium Waterproof Windbreaker",
      slug: "premium-windbreaker",
      description: "Stylish, breathable, and waterproof windbreaker jacket for outdoor adventures.",
      price: "79.00",
      images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop"],
      stock: 60,
      variant: "others",
      status: "normal",
      categoryId: catFashion.id,
    },
    {
      name: "Minimalist Leather Backpack",
      slug: "minimalist-leather-backpack",
      description: "Handcrafted top-grain leather backpack with laptop compartment.",
      price: "180.00",
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop"],
      stock: 35,
      variant: "others",
      status: "hot",
      categoryId: catFashion.id,
    },
    // Home & Living
    {
      name: "Sleek Ceramic Coffee Set",
      slug: "sleek-ceramic-coffee-set",
      description: "A set of 4 matte ceramic coffee mugs with elegant wood saucers.",
      price: "45.00",
      images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop"],
      stock: 40,
      variant: "appliances",
      status: "sale",
      categoryId: catHome.id,
    },
    {
      name: "Aromatic Reed Diffuser",
      slug: "aromatic-reed-diffuser",
      description: "Lavender and eucalyptus scented essential oil reed diffuser for fresh rooms.",
      price: "24.99",
      images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop"],
      stock: 150,
      variant: "appliances",
      status: "normal",
      categoryId: catHome.id,
    },
  ]);

  console.log("Products seeded successfully!");
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
