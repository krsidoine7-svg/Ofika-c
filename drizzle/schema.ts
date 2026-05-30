// =====================================================
// DRIZZLE ORM SCHEMA - Synchronisé avec Supabase
// Généré automatiquement depuis la base de données existante
// =====================================================

import { pgTable, text, varchar, boolean, timestamp, integer, decimal, jsonb, inet, date, uuid, serial, check, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =====================================================
// ENUMS
// =====================================================

export const profileTypeEnum = pgEnum('profile_type', ['professional', 'personal', 'event']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'enterprise', 'admin']);

// =====================================================
// TABLES PRINCIPALES
// =====================================================

// Table Users
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  preferredLanguage: varchar("preferred_language", { length: 5 }).default("fr"),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"),
  cardsOrdered: integer("cards_ordered").default(0),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Profiles
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileType: varchar("profile_type", { length: 20 }),
  name: varchar("name", { length: 100 }).notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  customUrl: varchar("custom_url", { length: 100 }).unique(),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  location: varchar("location", { length: 255 }),
  isPublic: boolean("is_public").default(true),
  isActive: boolean("is_active").default(true),
  displayReviews: boolean("display_reviews").default(false),
  designChoice: varchar("design_choice", { length: 50 }),
  colorTheme: varchar("color_theme", { length: 50 }),
  
  // Réseaux sociaux (nouveau format JSON)
  socialLinks: jsonb("social_links").default([]),
  customLinks: jsonb("custom_links").default([]),
  suspensionReason: text("suspension_reason"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Links
export const links = pgTable("links", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  url: text("url").notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  orderIndex: integer("order_index").default(0).notNull(),
  clickCount: integer("click_count").default(0),
  position: integer("position").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Cards
export const cards = pgTable("cards", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: text("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  nfcId: varchar("nfc_id", { length: 100 }).unique(),
  qrCode: text("qr_code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Card Designs
export const cardDesigns = pgTable("card_designs", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  cardId: text("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
  frontDesign: jsonb("front_design").notNull(),
  backDesign: jsonb("back_design").notNull(),
  logoPosition: varchar("logo_position", { length: 20 }).default("top-center"),
  textAlignment: varchar("text_alignment", { length: 20 }).default("center"),
  colorScheme: varchar("color_scheme", { length: 20 }).default("classic"),
  fontFamily: varchar("font_family", { length: 50 }).default("Inter"),
  fontSize: varchar("font_size", { length: 10 }).default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Orders
export const orders = pgTable("orders", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderNumber: varchar("order_number", { length: 20 }).unique().notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  cardType: varchar("card_type", { length: 50 }),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending").notNull(),
  paymentReference: varchar("payment_reference", { length: 100 }),
  shippingAddress: jsonb("shipping_address").notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  estimatedDelivery: date("estimated_delivery"),
  actualDelivery: date("actual_delivery"),
  
  // 💳 LYGOS - Paiements via LyGOS
  lygosPaymentId: text("lygos_payment_id"),
  lygosPaymentUrl: text("lygos_payment_url"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Payment Methods
export const paymentMethods = pgTable("payment_methods", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  methodType: varchar("method_type", { length: 20 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerId: varchar("provider_id", { length: 100 }),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Analytics Events
export const analyticsEvents = pgTable("analytics_events", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventData: jsonb("event_data"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 2 }),
  city: varchar("city", { length: 100 }),
  deviceType: varchar("device_type", { length: 20 }),
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  referrer: varchar("referrer", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Dashboard Widgets
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  widgetType: varchar("widget_type", { length: 50 }).notNull(),
  positionX: integer("position_x").default(0).notNull(),
  positionY: integer("position_y").default(0).notNull(),
  width: integer("width").default(4).notNull(),
  height: integer("height").default(3).notNull(),
  config: jsonb("config"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// =====================================================
// QR CODE DYNAMIQUE
// =====================================================

// Table QR Redirects
export const qrRedirects = pgTable("qr_redirects", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shortCode: varchar("short_code", { length: 20 }).unique().notNull(),
  nfcLink: text("nfc_link").notNull(),
  redirectType: varchar("redirect_type", { length: 50 }).default("custom"),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  scanCount: integer("scan_count").default(0),
  lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table QR Scans
export const qrScans = pgTable("qr_scans", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  qrRedirectId: text("qr_redirect_id").notNull().references(() => qrRedirects.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 2 }),
  city: varchar("city", { length: 100 }),
  deviceType: varchar("device_type", { length: 20 }),
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  referrer: varchar("referrer", { length: 500 }),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow().notNull(),
});

// =====================================================
// TEMPLATES DYNAMIQUES
// =====================================================

// Table Template Schemas
export const templateSchemas = pgTable("template_schemas", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),
  description: text("description"),
  schema: jsonb("schema").notNull().default({}),
  version: integer("version").default(1),
  isActive: boolean("is_active").default(true),
  category: varchar("category", { length: 50 }),
  icon: varchar("icon", { length: 50 }),
  priorityLabel: varchar("priority_label", { length: 50 }),
  targetAudience: text("target_audience"),
  features: text("features").array(),
  stats: jsonb("stats").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Table Profile Template Data
export const profileTemplateData = pgTable("profile_template_data", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().unique().references(() => profiles.id, { onDelete: "cascade" }),
  templateId: text("template_id").notNull().references(() => templateSchemas.id, { onDelete: "restrict" }),
  fields: jsonb("fields").notNull().default({}),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// =====================================================
// NFC PROFILES
// =====================================================

// Table Digital NFC Cards (ex nfc_profiles)
export const digitalNfcCards = pgTable("digital_nfc_cards", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileName: varchar("profile_name", { length: 255 }).notNull(),
  nfcLink: text("nfc_link").notNull(),
  designChoice: varchar("design_choice", { length: 50 }).default("classic"),
  colorTheme: varchar("color_theme", { length: 50 }).default("black"),
  qrCodeData: text("qr_code_data"),
  isActive: boolean("is_active").default(true),
  
  // Informations de profil
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  facebook: text("facebook"),
  instagram: text("instagram"),
  twitter: text("twitter"),
  linkedin: text("linkedin"),
  youtube: text("youtube"),
  tiktok: text("tiktok"),
  website: text("website"),
  bio: text("bio"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// =====================================================
// NFC CARDS
// =====================================================

export const nfcCards = pgTable("nfc_cards", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: text("profile_id").references(() => digitalNfcCards.id, { onDelete: "set null" }),
  cardIdentifier: varchar("card_identifier", { length: 100 }).unique().notNull(),
  cardType: varchar("card_type", { length: 50 }).default("nfc_qr"),
  designChoice: varchar("design_choice", { length: 50 }),
  colorTheme: varchar("color_theme", { length: 50 }),
  orderNumber: varchar("order_number", { length: 50 }),
  productionStatus: varchar("production_status", { length: 50 }).default("pending"),
  deliveryStatus: varchar("delivery_status", { length: 50 }).default("pending"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  isActivated: boolean("is_activated").default(false),
  activationDate: timestamp("activation_date", { withTimezone: true }),
  expirationDate: timestamp("expiration_date", { withTimezone: true }),
  customData: jsonb("custom_data"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// =====================================================
// RELATIONS
// =====================================================

export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  cards: many(cards),
  orders: many(orders),
  paymentMethods: many(paymentMethods),
  dashboardWidgets: many(dashboardWidgets),
  qrRedirects: many(qrRedirects),
  digitalNfcCards: many(digitalNfcCards),
  nfcCards: many(nfcCards),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  links: many(links),
  cards: many(cards),
  analyticsEvents: many(analyticsEvents),
  templateData: one(profileTemplateData),
}));

export const linksRelations = relations(links, ({ one }) => ({
  profile: one(profiles, {
    fields: [links.profileId],
    references: [profiles.id],
  }),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [cards.profileId],
    references: [profiles.id],
  }),
  design: one(cardDesigns),
}));

export const cardDesignsRelations = relations(cardDesigns, ({ one }) => ({
  card: one(cards, {
    fields: [cardDesigns.cardId],
    references: [cards.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  profile: one(profiles, {
    fields: [analyticsEvents.profileId],
    references: [profiles.id],
  }),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  user: one(users, {
    fields: [dashboardWidgets.userId],
    references: [users.id],
  }),
}));

export const qrRedirectsRelations = relations(qrRedirects, ({ one, many }) => ({
  user: one(users, {
    fields: [qrRedirects.userId],
    references: [users.id],
  }),
  scans: many(qrScans),
}));

export const qrScansRelations = relations(qrScans, ({ one }) => ({
  qrRedirect: one(qrRedirects, {
    fields: [qrScans.qrRedirectId],
    references: [qrRedirects.id],
  }),
}));

export const templateSchemasRelations = relations(templateSchemas, ({ many }) => ({
  profileTemplateData: many(profileTemplateData),
}));

export const profileTemplateDataRelations = relations(profileTemplateData, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileTemplateData.profileId],
    references: [profiles.id],
  }),
  template: one(templateSchemas, {
    fields: [profileTemplateData.templateId],
    references: [templateSchemas.id],
  }),
}));

export const digitalNfcCardsRelations = relations(digitalNfcCards, ({ one, many }) => ({
  user: one(users, {
    fields: [digitalNfcCards.userId],
    references: [users.id],
  }),
  nfcCards: many(nfcCards),
}));

export const nfcCardsRelations = relations(nfcCards, ({ one }) => ({
  user: one(users, {
    fields: [nfcCards.userId],
    references: [users.id],
  }),
  profile: one(digitalNfcCards, {
    fields: [nfcCards.profileId],
    references: [digitalNfcCards.id],
  }),
}));

// =====================================================
// TYPES EXPORTS
// =====================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type QrRedirect = typeof qrRedirects.$inferSelect;
export type NewQrRedirect = typeof qrRedirects.$inferInsert;

export type TemplateSchema = typeof templateSchemas.$inferSelect;
export type NewTemplateSchema = typeof templateSchemas.$inferInsert;

export type ProfileTemplateData = typeof profileTemplateData.$inferSelect;
export type NewProfileTemplateData = typeof profileTemplateData.$inferInsert;

export type DigitalNfcCard = typeof digitalNfcCards.$inferSelect;
export type NewDigitalNfcCard = typeof digitalNfcCards.$inferInsert;

export type NfcCard = typeof nfcCards.$inferSelect;
export type NewNfcCard = typeof nfcCards.$inferInsert;
