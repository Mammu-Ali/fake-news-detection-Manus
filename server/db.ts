import { and, desc, eq, gte, like, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, predictions, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = new Date();
  }
  if (user.role) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listPredictions(userId: number, options: { search?: string; sort?: "newest" | "oldest" | "confidence"; verdict?: "all" | "Fake" | "Real"; minConfidence?: number; maxConfidence?: number; from?: string; to?: string } = {}) {
  const db = await getDb();
  if (!db) return [];
  const filters = [eq(predictions.userId, userId)];
  if (options.search) filters.push(or(like(predictions.articleText, `%${options.search}%`), like(predictions.verdict, `%${options.search}%`))!);
  if (options.verdict && options.verdict !== "all") filters.push(eq(predictions.verdict, options.verdict));
  if (options.minConfidence !== undefined) filters.push(gte(predictions.confidence, options.minConfidence));
  if (options.maxConfidence !== undefined) filters.push(lte(predictions.confidence, options.maxConfidence));
  if (options.from) filters.push(gte(predictions.createdAt, new Date(`${options.from}T00:00:00`)));
  if (options.to) filters.push(lte(predictions.createdAt, new Date(`${options.to}T23:59:59`)));
  const order = options.sort === "oldest" ? predictions.createdAt : options.sort === "confidence" ? predictions.confidence : desc(predictions.createdAt);
  return db.select().from(predictions).where(and(...filters)).orderBy(order);
}

export function filterAndSortPredictions<T extends { verdict: "Fake" | "Real"; articleText?: string; confidence?: number; createdAt?: Date }>(rows: T[], options: { search?: string; sort?: "newest" | "oldest" | "confidence"; verdict?: "all" | "Fake" | "Real"; minConfidence?: number; maxConfidence?: number; from?: string; to?: string } = {}) {
  const filtered = rows.filter(row => {
    const matchesSearch = !options.search || (row.articleText ?? "").toLowerCase().includes(options.search.toLowerCase()) || row.verdict.toLowerCase().includes(options.search.toLowerCase());
    const matchesVerdict = !options.verdict || options.verdict === "all" || row.verdict === options.verdict;
    const matchesMin = options.minConfidence === undefined || (row.confidence ?? 0) >= options.minConfidence;
    const matchesMax = options.maxConfidence === undefined || (row.confidence ?? 100) <= options.maxConfidence;
    const time = row.createdAt?.getTime() ?? 0;
    const from = options.from ? new Date(`${options.from}T00:00:00`).getTime() : -Infinity;
    const to = options.to ? new Date(`${options.to}T23:59:59`).getTime() : Infinity;
    return matchesSearch && matchesVerdict && matchesMin && matchesMax && time >= from && time <= to;
  });
  return [...filtered].sort((a, b) => options.sort === "oldest" ? (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0) : options.sort === "confidence" ? (b.confidence ?? 0) - (a.confidence ?? 0) : (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

export function summarizePredictions<T extends { verdict: "Fake" | "Real" }>(rows: T[]) {
  const fake = rows.filter(row => row.verdict === "Fake").length;
  const real = rows.filter(row => row.verdict === "Real").length;
  return {
    total: rows.length,
    fake,
    real,
    fakePercentage: rows.length ? Math.round((fake / rows.length) * 100) : 0,
    realPercentage: rows.length ? Math.round((real / rows.length) * 100) : 0,
    recent: rows.slice(0, 5),
  };
}

export async function getPredictionStats(userId: number) {
  const rows = await listPredictions(userId);
  return summarizePredictions(rows);
}

export async function createPrediction(input: typeof predictions.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(predictions).values(input);
  return Number(result[0].insertId);
}

export async function deletePrediction(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(predictions).where(and(eq(predictions.id, id), eq(predictions.userId, userId)));
  return result[0].affectedRows > 0;
}
