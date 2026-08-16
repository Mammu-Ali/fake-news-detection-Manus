import { desc, eq } from "drizzle-orm";
import { datasets, modelMetrics } from "../drizzle/schema";
import { getDb } from "./db";
import { storagePut } from "./storage";

export async function listDatasets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(datasets).orderBy(desc(datasets.createdAt));
}

export async function createDataset(input: Omit<typeof datasets.$inferInsert, "storageKey" | "storageUrl"> & { fileContentBase64?: string }) {
  const db = await getDb();
  if (!db) return null;
  let storageKey: string | undefined;
  let storageUrl: string | undefined;
  if (input.fileContentBase64) {
    const uploaded = await storagePut(`datasets/${input.uploadedBy}/${input.fileName}`, Buffer.from(input.fileContentBase64, "base64"), "text/plain");
    storageKey = uploaded.key;
    storageUrl = uploaded.url;
  }
  const { fileContentBase64: _fileContentBase64, ...record } = input;
  const result = await db.insert(datasets).values({ ...record, storageKey, storageUrl });
  return Number(result[0].insertId);
}

export async function archiveDataset(id: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.update(datasets).set({ status: "archived" }).where(eq(datasets.id, id));
  return result[0].affectedRows > 0;
}

export async function deleteDataset(id: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(datasets).where(eq(datasets.id, id));
  return result[0].affectedRows > 0;
}

export async function listModelMetrics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(modelMetrics).orderBy(desc(modelMetrics.evaluatedAt));
}

export async function createModelMetric(input: typeof modelMetrics.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(modelMetrics).values(input);
  return Number(result[0].insertId);
}
