// =====================================================================
// Danko Mkholwa — database schema (Drizzle ORM, PostgreSQL)
// ---------------------------------------------------------------------
// Every table the website needs lives here. Drizzle reads this file to
// create the real tables (`npx drizzle-kit push`) and to give us fully
// typed queries in the rest of the code.
//
// Money is stored in CENTS (integers) — never floats — so R60 is 6000.
// =====================================================================
import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---- JSON shapes stored inside jsonb columns -------------------------
export type VariationOption = { label: string; priceDeltaCents: number };
export type VariationGroup = { name: string; options: VariationOption[] };
export type Extra = { label: string; priceCents: number };
export type DayHours = { open: string; close: string; closed: boolean };
export type OpeningHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  DayHours
>;

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// ---- Menu -----------------------------------------------------------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPromo: boolean("is_promo").notNull().default(false),
  promoTagline: text("promo_tagline"),
  variations: jsonb("variations")
    .$type<VariationGroup[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  extras: jsonb("extras")
    .$type<Extra[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---- Customers & orders --------------------------------------------
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  createdAt: createdAt(),
  lastOrderAt: timestamp("last_order_at", { withTimezone: true }),
});

export const deliveryZones = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  feeCents: integer("fee_cents").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(), // e.g. DM-7K2Q9X
  clientKey: text("client_key").unique(), // prevents duplicate submissions
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  fulfilment: text("fulfilment").notNull(), // 'delivery' | 'collection'
  deliveryAddress: text("delivery_address"),
  deliveryZoneId: integer("delivery_zone_id").references(
    () => deliveryZones.id,
    { onDelete: "set null" },
  ),
  deliveryZoneName: text("delivery_zone_name"),
  deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
  deliveryFeeConfirmed: boolean("delivery_fee_confirmed")
    .notNull()
    .default(true),
  subtotalCents: integer("subtotal_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  specialInstructions: text("special_instructions"),
  status: text("status").notNull().default("pending"),
  source: text("source").notNull().default("website"),
  ownerNotes: text("owner_notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  selectedOptions: jsonb("selected_options")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  extras: jsonb("extras")
    .$type<Extra[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  notes: text("notes"),
  lineTotalCents: integer("line_total_cents").notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  note: text("note"),
  changedBy: text("changed_by").notNull().default("owner"),
  createdAt: createdAt(),
});

// ---- Restaurant settings (single row, id = 1) -----------------------
export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  businessName: text("business_name").notNull(),
  slogan: text("slogan").notNull(),
  callToAction: text("call_to_action").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  instagramHandle: text("instagram_handle").notNull(),
  address: text("address").notNull(),
  aboutText: text("about_text").notNull(),
  deliveryAreaText: text("delivery_area_text").notNull(),
  acceptingOrders: boolean("accepting_orders").notNull().default(true),
  deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
  collectionEnabled: boolean("collection_enabled").notNull().default(true),
  deliveryNote: text("delivery_note"),
  openingHours: jsonb("opening_hours").$type<OpeningHours>().notNull(),
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  adminPasswordHash: text("admin_password_hash"),
  sessionSecret: text("session_secret").notNull(),
  updatedAt: updatedAt(),
});

// ---- Media (photos stored in the database, served by /api/media/:id) -
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  kind: text("kind").notNull().default("other"), // logo | product | promotion | gallery | menu | other
  dataBase64: text("data_base64").notNull(),
  createdAt: createdAt(),
});

// ---- Gallery & reviews (owner approval required) -------------------
export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  submittedBy: text("submitted_by"),
  source: text("source").notNull().default("owner"), // owner | customer
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  createdAt: createdAt(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  orderReference: text("order_reference"),
  isVerified: boolean("is_verified").notNull().default(false),
  status: text("status").notNull().default("pending"),
  createdAt: createdAt(),
});
