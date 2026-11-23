// =====================================================================
// First-run seeding. Called by getSettings() — if the database is empty
// it inserts the real Danko Mkholwa settings, categories and the four
// confirmed products. Nothing is invented: Loaded Fries and Combos stay
// empty until the owner adds products in the dashboard.
// =====================================================================
import { randomBytes } from "crypto";
import { db } from "@/db";
import { categories, products, settings, type OpeningHours } from "./schema";

export const DEFAULT_HOURS: OpeningHours = {
  mon: { open: "08:00", close: "20:00", closed: false },
  tue: { open: "08:00", close: "20:00", closed: false },
  wed: { open: "08:00", close: "20:00", closed: false },
  thu: { open: "08:00", close: "20:00", closed: false },
  fri: { open: "08:00", close: "20:00", closed: false },
  sat: { open: "08:00", close: "20:00", closed: false },
  sun: { open: "08:00", close: "20:00", closed: false },
};

export const BUSINESS_DEFAULTS = {
  businessName: "Danko Mkholwa",
  slogan: "Flavour that feels like home.",
  callToAction: "Order, Chommie!",
  whatsappNumber: "076 712 4232",
  instagramHandle: "danko_mkholwa",
  address: "MD29St D6130, Section 4, Newcastle, KwaZulu-Natal, South Africa",
  aboutText:
    "Danko Mkholwa is a proudly South African food business from Section 4, Newcastle, KwaZulu-Natal. " +
    "We make burgers, loaded fries and refreshing mocktails with big flavour and even bigger heart. " +
    "Danko is thank you — every order is a thank you to the community that supports us. Eat good. Feel good.",
  deliveryAreaText: "Newcastle and surrounding areas.",
  deliveryNote:
    "Delivery fees depend on your area and are confirmed with you on WhatsApp before we prepare your order.",
};

let seededThisProcess = false;

export async function ensureSeeded() {
  if (seededThisProcess) return;

  const existingSettings = await db
    .select({ id: settings.id })
    .from(settings)
    .limit(1);

  if (existingSettings.length === 0) {
    await db
      .insert(settings)
      .values({
        id: 1,
        ...BUSINESS_DEFAULTS,
        acceptingOrders: true,
        deliveryEnabled: true,
        collectionEnabled: true,
        openingHours: DEFAULT_HOURS,
        logoUrl: null,
        heroImageUrl: null,
        adminPasswordHash: null,
        sessionSecret: randomBytes(32).toString("hex"),
      })
      .onConflictDoNothing();
  }

  const existingCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .limit(1);

  if (existingCategories.length === 0) {
    const inserted = await db
      .insert(categories)
      .values([
        {
          name: "Burgers",
          slug: "burgers",
          description: "Juicy, cheesy and made with love.",
          sortOrder: 1,
        },
        {
          name: "Loaded Fries",
          slug: "loaded-fries",
          description: "Golden fries piled high with toppings.",
          sortOrder: 2,
        },
        {
          name: "Mocktails & Drinks",
          slug: "mocktails-drinks",
          description: "Ice-cold, fruity and refreshing.",
          sortOrder: 3,
        },
        {
          name: "Combos & Meal Deals",
          slug: "combos-meal-deals",
          description: "We're just getting started! More deliciousness coming soon…",
          sortOrder: 4,
        },
      ])
      .onConflictDoNothing()
      .returning({ id: categories.id, slug: categories.slug });

    const idBySlug = Object.fromEntries(inserted.map((c) => [c.slug, c.id]));

    if (idBySlug["burgers"] && idBySlug["mocktails-drinks"]) {
      await db
        .insert(products)
        .values([
          {
            categoryId: idBySlug["burgers"],
            name: "Cheeseburger",
            slug: "cheeseburger",
            description:
              "Our classic Danko cheeseburger — a juicy patty with melted cheese, crisp lettuce and Danko sauce in a soft bun.",
            priceCents: 6000,
            imageUrl: "/assets/products/cheeseburger.jpg",
            isFeatured: true,
            sortOrder: 2,
          },
          {
            categoryId: idBySlug["burgers"],
            name: "Danko Is Thank You Double Cheeseburger",
            slug: "danko-is-thank-you-double-cheeseburger",
            description:
              "Danko is thank you! Two patties, double cheese, egg, crispy onions, tomato and lettuce, dripping with sauce. Big flavour. Bigger satisfaction.",
            priceCents: 8000,
            imageUrl: "/assets/products/double-cheeseburger.jpg",
            isFeatured: true,
            isPromo: true,
            promoTagline: "Big Flavour. Bigger Satisfaction.",
            sortOrder: 1,
          },
          {
            categoryId: idBySlug["mocktails-drinks"],
            name: "Blueberry Mint Mojito",
            slug: "blueberry-mint-mojito",
            description:
              "A refreshing non-alcoholic mojito with blueberries, fresh mint and lemon, served ice-cold.",
            priceCents: 2500,
            imageUrl: "/assets/products/blueberry-mint-mojito.jpg",
            isFeatured: true,
            sortOrder: 1,
          },
          {
            categoryId: idBySlug["mocktails-drinks"],
            name: "Sweet Berry Breeze",
            slug: "sweet-berry-breeze",
            description:
              "Sweet, fruity and ice-cold — a berry mocktail finished with fresh mint.",
            priceCents: 2500,
            imageUrl: "/assets/products/sweet-berry-breeze.jpg",
            isFeatured: true,
            sortOrder: 2,
          },
        ])
        .onConflictDoNothing();
    }
  }

  seededThisProcess = true;
}
