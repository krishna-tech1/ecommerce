import { pgTable, text, timestamp, integer, numeric, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- USERS TABLE ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email"),
  password: text("password"),
  phone: text("phone").unique(),
  role: text("role").default("user").notNull(), // "user" or "admin"
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
  utmMedium: text("utm_medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- CATEGORIES TABLE ---
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- PRODUCTS TABLE ---
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  images: text("images").array().notNull(), // Array of image URLs
  stock: integer("stock").default(0).notNull(),
  variant: text("variant").default("gadget").notNull(), // e.g. "gadget", "appliances"
  status: text("status").default("normal").notNull(), // e.g. "hot", "sale"
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- ORDERS TABLE ---
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // "pending", "paid", "shipped", "cancelled"
  stripeSessionId: text("stripe_session_id").unique(),
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
  utmMedium: text("utm_medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- ORDER ITEMS TABLE ---
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

// --- RELATIONS ---
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// --- META PIXEL EVENTS TABLE ---
export const metaEvents = pgTable("meta_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventName: text("event_name").notNull(),
  url: text("url").notNull(),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- ABANDONED CARTS TABLE ---
export const abandonedCarts = pgTable("abandoned_carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  productName: text("product_name"),
  abandonedAt: timestamp("abandoned_at").defaultNow().notNull(),
  watiMessageSentAt: timestamp("wati_message_sent_at"),
  recovered: text("recovered").default("false").notNull(), // "true" or "false"
  revenue: numeric("revenue", { precision: 10, scale: 2 }),
  utmSource: text("utm_source"),
  utmCampaign: text("utm_campaign"),
});

// --- BLOGS TABLE ---
export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  category: text("category"),
  author: text("author"),
  image: text("image"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
