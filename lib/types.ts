/**
 * Shared local types — replaces Sanity-generated types throughout the app.
 * These mirror the shape that /api/products returns (formatted from the DB).
 */

export interface DbProduct {
  _id: string;
  _type: "product";
  name: string;
  slug: { current: string };
  description?: string | null;
  price: number;
  discount?: number;
  images: string[]; // plain URL strings — NOT Sanity image references
  stock: number;
  variant?: string | null; // "gadget" | "appliances" etc.
  status?: string | null; // "sale" | "hot" | "normal"
  categories?: string[]; // category names as plain strings
  createdAt?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
  createdAt?: string;
}
