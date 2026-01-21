import { Keypair, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, getAccount, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import bs58 from "bs58";
import crypto from "crypto";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

function getEncryptionKey(): string {
  const key = process.env.WALLET_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!key) {
    throw new Error("WALLET_ENCRYPTION_KEY or SESSION_SECRET must be set for secure wallet storage");
  }
  return key;
}

const connection = new Connection(SOLANA_RPC_URL, "confirmed");

export interface SolanaWallet {
  publicKey: string;
  encryptedPrivateKey: string;
}

function encrypt(text: string): string {
  const encryptionKey = getEncryptionKey();
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const encryptionKey = getEncryptionKey();
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function generateSolanaWallet(): SolanaWallet {
  const keypair = Keypair.generate();
  const privateKeyBase58 = bs58.encode(keypair.secretKey);
  return {
    publicKey: keypair.publicKey.toBase58(),
    encryptedPrivateKey: encrypt(privateKeyBase58),
  };
}

export function getKeypairFromEncryptedKey(encryptedPrivateKey: string): Keypair {
  const privateKeyBase58 = decrypt(encryptedPrivateKey);
  const secretKey = bs58.decode(privateKeyBase58);
  return Keypair.fromSecretKey(secretKey);
}

export async function getSolBalance(address: string): Promise<number> {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error getting SOL balance:", error);
    return 0;
  }
}

export async function getUsdcBalance(address: string): Promise<number> {
  try {
    const publicKey = new PublicKey(address);
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT_DEVNET, publicKey);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount) / 1_000_000;
  } catch (error) {
    return 0;
  }
}

export async function sendSol(
  encryptedPrivateKey: string,
  toAddress: string,
  amount: number
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }
    const fromKeypair = getKeypairFromEncryptedKey(encryptedPrivateKey);
    const toPubkey = new PublicKey(toAddress);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
    return { success: true, signature };
  } catch (error: any) {
    console.error("Error sending SOL:", error);
    return { success: false, error: error.message };
  }
}

export async function sendUsdc(
  encryptedPrivateKey: string,
  toAddress: string,
  amount: number
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }
    const fromKeypair = getKeypairFromEncryptedKey(encryptedPrivateKey);
    const toPubkey = new PublicKey(toAddress);
    
    const fromTokenAccount = await getAssociatedTokenAddress(USDC_MINT_DEVNET, fromKeypair.publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(USDC_MINT_DEVNET, toPubkey);
    
    let toTokenAccountExists = true;
    try {
      await getAccount(connection, toTokenAccount);
    } catch {
      toTokenAccountExists = false;
    }
    
    const transaction = new Transaction();
    
    if (!toTokenAccountExists) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromKeypair.publicKey,
          toTokenAccount,
          toPubkey,
          USDC_MINT_DEVNET
        )
      );
    }
    
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromKeypair.publicKey,
        amount * 1_000_000,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
    return { success: true, signature };
  } catch (error: any) {
    console.error("Error sending USDC:", error);
    return { success: false, error: error.message };
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export { connection, SOLANA_RPC_URL };
