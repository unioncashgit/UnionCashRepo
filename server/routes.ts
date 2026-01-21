import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerSchema, loginSchema, passcodeSchema } from "@shared/schema";
import { generateSolanaWallet, getSolBalance, getUsdcBalance, sendSol, sendUsdc, isValidSolanaAddress } from "./solana";

const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    passcodeVerified?: boolean;
  }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.session.passcodeVerified) {
    return res.status(403).json({ message: "Passcode required", requiresPasscode: true });
  }
  next();
}

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function generateCardNumber(): string {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(String(Math.floor(1000 + Math.random() * 9000)));
  }
  return segments.join("");
}

function generateExpiryDate(): string {
  const now = new Date();
  const year = now.getFullYear() + 3;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${month}/${String(year).slice(-2)}`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Trust proxy for production (Replit uses reverse proxy)
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.errors });
      }

      const { username, password, firstName, lastName } = parsed.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        passwordHash,
        firstName,
        lastName,
      });

      req.session.userId = user.id;
      req.session.passcodeVerified = false;

      res.json({ 
        id: user.id, 
        username: user.username, 
        firstName: user.firstName,
        lastName: user.lastName,
        hasPasscode: !!user.passcode,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const { username, password } = parsed.data;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      req.session.passcodeVerified = !user.passcode;

      res.json({ 
        id: user.id, 
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        hasPasscode: !!user.passcode,
        passcodeVerified: req.session.passcodeVerified,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/verify-passcode", isLoggedIn, async (req: Request, res: Response) => {
    try {
      const parsed = passcodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid passcode format" });
      }

      const user = await storage.getUserById(req.session.userId!);
      if (!user || !user.passcode) {
        return res.status(400).json({ message: "Passcode not set" });
      }

      if (user.passcode !== parsed.data.passcode) {
        return res.status(401).json({ message: "Invalid passcode" });
      }

      req.session.passcodeVerified = true;
      res.json({ success: true });
    } catch (error) {
      console.error("Passcode verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/set-passcode", isLoggedIn, async (req: Request, res: Response) => {
    try {
      const parsed = passcodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Passcode must be 6 digits" });
      }

      await storage.updateUserPasscode(req.session.userId!, parsed.data.passcode);
      req.session.passcodeVerified = true;

      res.json({ success: true });
    } catch (error) {
      console.error("Set passcode error:", error);
      res.status(500).json({ message: "Failed to set passcode" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      hasPasscode: !!user.passcode,
      passcodeVerified: req.session.passcodeVerified,
    });
  });

  app.get("/api/wallet", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      let wallet = await storage.getWallet(userId);
      
      if (!wallet) {
        wallet = await storage.createWallet({
          userId,
          fiatBalance: "0.00",
          solBalance: "0.00",
          usdcBalance: "0.00",
        });
      }
      
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { type, amount, currency, recipientAddress, description, category } = req.body;
      
      const transaction = await storage.createTransaction({
        userId,
        type,
        amount: String(amount),
        currency: currency || "USD",
        recipientAddress,
        description,
        category,
        status: "completed",
      });

      const wallet = await storage.getWallet(userId);
      if (wallet) {
        const amountNum = parseFloat(amount);
        if (type === "send" || type === "payment") {
          if (currency === "SOL") {
            const newBalance = parseFloat(wallet.solBalance || "0") - amountNum;
            await storage.updateWallet(userId, { solBalance: String(Math.max(0, newBalance)) });
          } else if (currency === "USDC") {
            const newBalance = parseFloat(wallet.usdcBalance || "0") - amountNum;
            await storage.updateWallet(userId, { usdcBalance: String(Math.max(0, newBalance)) });
          } else {
            const newBalance = parseFloat(wallet.fiatBalance || "0") - amountNum;
            await storage.updateWallet(userId, { fiatBalance: String(Math.max(0, newBalance)) });
          }
        } else if (type === "receive" || type === "topup") {
          if (currency === "SOL") {
            const newBalance = parseFloat(wallet.solBalance || "0") + amountNum;
            await storage.updateWallet(userId, { solBalance: String(newBalance) });
          } else if (currency === "USDC") {
            const newBalance = parseFloat(wallet.usdcBalance || "0") + amountNum;
            await storage.updateWallet(userId, { usdcBalance: String(newBalance) });
          } else {
            const newBalance = parseFloat(wallet.fiatBalance || "0") + amountNum;
            await storage.updateWallet(userId, { fiatBalance: String(newBalance) });
          }
        }
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/cards", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const cards = await storage.getCards(userId);
      const safeCards = cards.map(card => ({
        ...card,
        solanaPrivateKey: undefined,
      }));
      res.json(safeCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.post("/api/cards", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { cardType = "virtual" } = req.body;
      
      const user = await storage.getUserById(userId);
      const cardHolder = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username : "Card Holder";
      
      const solanaWallet = generateSolanaWallet();
      
      const card = await storage.createCard({
        userId,
        cardNumber: generateCardNumber(),
        cardHolder,
        expiryDate: generateExpiryDate(),
        cardType,
        isActive: true,
        isFrozen: false,
        dailyLimit: "1000",
        monthlyLimit: "10000",
        solanaAddress: solanaWallet.publicKey,
        solanaPrivateKey: solanaWallet.encryptedPrivateKey,
      });
      
      res.json({
        ...card,
        solanaPrivateKey: undefined,
      });
    } catch (error) {
      console.error("Error creating card:", error);
      res.status(500).json({ message: "Failed to create card" });
    }
  });

  app.patch("/api/cards/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const id = req.params.id as string;
      
      const existingCard = await storage.getCard(id);
      if (!existingCard) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (existingCard.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { isFrozen, dailyLimit, monthlyLimit } = req.body;
      const card = await storage.updateCard(id, { isFrozen, dailyLimit, monthlyLimit });
      
      res.json({
        ...card,
        solanaPrivateKey: undefined,
      });
    } catch (error) {
      console.error("Error updating card:", error);
      res.status(500).json({ message: "Failed to update card" });
    }
  });

  app.get("/api/cards/:id/balance", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const id = req.params.id as string;
      
      const card = await storage.getCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (card.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (!card.solanaAddress) {
        return res.json({ sol: 0, usdc: 0 });
      }
      
      const [solBalance, usdcBalance] = await Promise.all([
        getSolBalance(card.solanaAddress),
        getUsdcBalance(card.solanaAddress),
      ]);
      
      res.json({ sol: solBalance, usdc: usdcBalance });
    } catch (error) {
      console.error("Error fetching card balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  app.post("/api/cards/:id/send", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const id = req.params.id as string;
      const { currency, amount, recipientAddress } = req.body;
      
      if (!currency || amount === undefined || amount === null || !recipientAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const parsedAmount = parseFloat(String(amount));
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      
      const validCurrencies = ["SOL", "USDC"];
      if (!validCurrencies.includes(currency.toUpperCase())) {
        return res.status(400).json({ message: "Currency must be SOL or USDC" });
      }
      
      if (!isValidSolanaAddress(recipientAddress)) {
        return res.status(400).json({ message: "Invalid Solana address" });
      }
      
      const card = await storage.getCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (card.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (!card.solanaPrivateKey) {
        return res.status(400).json({ message: "Card has no Solana wallet" });
      }
      
      let result;
      if (currency.toUpperCase() === "SOL") {
        result = await sendSol(card.solanaPrivateKey, recipientAddress, parsedAmount);
      } else {
        result = await sendUsdc(card.solanaPrivateKey, recipientAddress, parsedAmount);
      }
      
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Transaction failed" });
      }
      
      await storage.createTransaction({
        userId,
        type: "send",
        amount: String(parsedAmount),
        currency: currency.toUpperCase(),
        recipientAddress,
        senderAddress: card.solanaAddress,
        description: `Sent ${amount} ${currency.toUpperCase()} to ${recipientAddress.slice(0, 8)}...`,
        status: "completed",
      });
      
      res.json({ success: true, signature: result.signature });
    } catch (error) {
      console.error("Error sending crypto:", error);
      res.status(500).json({ message: "Failed to send transaction" });
    }
  });

  app.get("/api/budgets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const budgets = await storage.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { category, limit, period = "monthly" } = req.body;
      
      const budget = await storage.createBudget({
        userId,
        category,
        limit: String(limit),
        spent: "0",
        period,
      });
      
      res.json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.get("/api/security", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      let settings = await storage.getSecuritySettings(userId);
      
      if (!settings) {
        settings = await storage.upsertSecuritySettings({
          userId,
          twoFactorEnabled: false,
          biometricEnabled: false,
          transactionNotifications: true,
          loginNotifications: true,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching security settings:", error);
      res.status(500).json({ message: "Failed to fetch security settings" });
    }
  });

  app.patch("/api/security", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const settings = await storage.upsertSecuritySettings({
        userId,
        ...req.body,
      });
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating security settings:", error);
      res.status(500).json({ message: "Failed to update security settings" });
    }
  });

  app.get("/api/preferences", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      let preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        preferences = await storage.upsertUserPreferences({
          userId,
          theme: "light",
          currency: "USD",
          language: "en",
        });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.patch("/api/preferences", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const preferences = await storage.upsertUserPreferences({
        userId,
        ...req.body,
      });
      
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  return httpServer;
}
