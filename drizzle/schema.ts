import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const datasets = mysqlTable("datasets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }),
  storageUrl: varchar("storageUrl", { length: 600 }),
  recordCount: int("recordCount").notNull(),
  fakeCount: int("fakeCount").notNull(),
  realCount: int("realCount").notNull(),
  status: mysqlEnum("status", ["ready", "processing", "archived"]).default("ready").notNull(),
  version: varchar("version", { length: 32 }).notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const modelMetrics = mysqlTable("modelMetrics", {
  id: int("id").autoincrement().primaryKey(),
  modelName: varchar("modelName", { length: 120 }).notNull(),
  datasetName: varchar("datasetName", { length: 180 }).notNull(),
  accuracy: int("accuracy").notNull(),
  precision: int("precision").notNull(),
  recall: int("recall").notNull(),
  f1Score: int("f1Score").notNull(),
  truePositive: int("truePositive").notNull(),
  trueNegative: int("trueNegative").notNull(),
  falsePositive: int("falsePositive").notNull(),
  falseNegative: int("falseNegative").notNull(),
  evaluatedAt: timestamp("evaluatedAt").defaultNow().notNull(),
});

export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  articleText: text("articleText").notNull(),
  verdict: mysqlEnum("verdict", ["Fake", "Real"]).notNull(),
  confidence: int("confidence").notNull(),
  processingTimeMs: int("processingTimeMs").notNull(),
  explanation: text("explanation").notNull(),
  linguisticPatterns: text("linguisticPatterns").notNull(),
  emotionalTone: text("emotionalTone").notNull(),
  credibilitySignals: text("credibilitySignals").notNull(),
  highlightedPhrases: text("highlightedPhrases").notNull(),
  signals: text("signals").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = typeof datasets.$inferInsert;
export type ModelMetric = typeof modelMetrics.$inferSelect;
export type InsertModelMetric = typeof modelMetrics.$inferInsert;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;
