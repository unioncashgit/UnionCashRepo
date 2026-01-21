import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fiatBalance: decimal("fiat_balance", { precision: 18, scale: 2 }).default("0").notNull(),
  solBalance: decimal("sol_balance", { precision: 18, scale: 9 }).default("0").notNull(),
  usdcBalance: decimal("usdc_balance", { precision: 18, scale: 6 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  category: varchar("category", { length: 50 }),
  currency: varchar("currency", { length: 10 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 9 }).notNull(),
  recipientAddress: varchar("recipient_address"),
  senderAddress: varchar("sender_address"),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cardNumber: varchar("card_number", { length: 19 }).notNull(),
  cardHolder: varchar("card_holder").notNull(),
  expiryDate: varchar("expiry_date", { length: 5 }).notNull(),
  cardType: varchar("card_type", { length: 20 }).default("virtual").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFrozen: boolean("is_frozen").default(false).notNull(),
  dailyLimit: decimal("daily_limit", { precision: 18, scale: 2 }).default("1000"),
  monthlyLimit: decimal("monthly_limit", { precision: 18, scale: 2 }).default("10000"),
  solanaAddress: varchar("solana_address", { length: 44 }),
  solanaPrivateKey: text("solana_private_key"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  limit: decimal("limit", { precision: 18, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 18, scale: 2 }).default("0").notNull(),
  period: varchar("period", { length: 20 }).default("monthly").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const securitySettings = pgTable("security_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  biometricEnabled: boolean("biometric_enabled").default(false).notNull(),
  transactionNotifications: boolean("transaction_notifications").default(true).notNull(),
  loginNotifications: boolean("login_notifications").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  theme: varchar("theme", { length: 20 }).default("light").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true, createdAt: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSecuritySettingsSchema = createInsertSchema(securitySettings).omit({ id: true, updatedAt: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, updatedAt: true });

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type SecuritySettings = typeof securitySettings.$inferSelect;
export type InsertSecuritySettings = z.infer<typeof insertSecuritySettingsSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
