import { 
  wallets, transactions, cards, budgets, securitySettings, userPreferences,
  users,
  type Wallet, type InsertWallet,
  type Transaction, type InsertTransaction,
  type Card, type InsertCard,
  type Budget, type InsertBudget,
  type SecuritySettings, type InsertSecuritySettings,
  type UserPreferences, type InsertUserPreferences,
  type User, type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUserPasscode(userId: string, passcode: string): Promise<User | undefined>;
  getWallet(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(userId: string, data: Partial<Wallet>): Promise<Wallet | undefined>;

  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  getCards(userId: string): Promise<Card[]>;
  getCard(id: string): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: string, data: Partial<Card>): Promise<Card | undefined>;

  getBudgets(userId: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, data: Partial<Budget>): Promise<Budget | undefined>;

  getSecuritySettings(userId: string): Promise<SecuritySettings | undefined>;
  upsertSecuritySettings(settings: InsertSecuritySettings): Promise<SecuritySettings>;

  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: UpsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUserPasscode(userId: string, passcode: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ passcode, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [created] = await db.insert(wallets).values(wallet).returning();
    return created;
  }

  async updateWallet(userId: string, data: Partial<Wallet>): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wallets.userId, userId))
      .returning();
    return updated;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async getCards(userId: string): Promise<Card[]> {
    return db.select().from(cards).where(eq(cards.userId, userId));
  }

  async getCard(id: string): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card;
  }

  async createCard(card: InsertCard): Promise<Card> {
    const [created] = await db.insert(cards).values(card).returning();
    return created;
  }

  async updateCard(id: string, data: Partial<Card>): Promise<Card | undefined> {
    const [updated] = await db.update(cards).set(data).where(eq(cards.id, id)).returning();
    return updated;
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    return db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [created] = await db.insert(budgets).values(budget).returning();
    return created;
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget | undefined> {
    const [updated] = await db
      .update(budgets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgets.id, id))
      .returning();
    return updated;
  }

  async getSecuritySettings(userId: string): Promise<SecuritySettings | undefined> {
    const [settings] = await db.select().from(securitySettings).where(eq(securitySettings.userId, userId));
    return settings;
  }

  async upsertSecuritySettings(settings: InsertSecuritySettings): Promise<SecuritySettings> {
    const [result] = await db
      .insert(securitySettings)
      .values(settings)
      .onConflictDoUpdate({
        target: securitySettings.userId,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...preferences, updatedAt: new Date() },
      })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
