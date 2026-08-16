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
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;
