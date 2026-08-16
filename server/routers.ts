import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { archiveDataset, createDataset, createModelMetric, deleteDataset, listDatasets, listModelMetrics } from "./adminDb";
import { createPrediction, deletePrediction, getPredictionStats, listPredictions } from "./db";

const predictionSchema = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["Fake", "Real"] },
    confidence: { type: "integer", minimum: 1, maximum: 99 },
    explanation: { type: "string" },
    linguisticPatterns: { type: "string" },
    emotionalTone: { type: "string" },
    credibilitySignals: { type: "string" },
    highlightedPhrases: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
    signals: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
  },
  required: ["verdict", "confidence", "explanation", "linguisticPatterns", "emotionalTone", "credibilitySignals", "highlightedPhrases", "signals"],
  additionalProperties: false,
} as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  admin: router({
    datasets: router({
      list: adminProcedure.query(() => listDatasets()),
      create: adminProcedure.input(z.object({ name: z.string().min(2).max(180), description: z.string().max(2000).default(""), fileName: z.string().min(1).max(255), fileContentBase64: z.string().optional(), recordCount: z.number().int().min(0), fakeCount: z.number().int().min(0), realCount: z.number().int().min(0), version: z.string().min(1).max(32) })).mutation(({ ctx, input }) => createDataset({ ...input, status: "ready", uploadedBy: ctx.user.id })),
      archive: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => archiveDataset(input.id)),
      remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteDataset(input.id)),
    }),
    metrics: router({
      list: adminProcedure.query(() => listModelMetrics()),
      create: adminProcedure.input(z.object({ modelName: z.string().min(2).max(120), datasetName: z.string().min(2).max(180), accuracy: z.number().int().min(0).max(100), precision: z.number().int().min(0).max(100), recall: z.number().int().min(0).max(100), f1Score: z.number().int().min(0).max(100), truePositive: z.number().int().min(0), trueNegative: z.number().int().min(0), falsePositive: z.number().int().min(0), falseNegative: z.number().int().min(0) })).mutation(({ input }) => createModelMetric(input)),
    }),
  }),
  predictions: router({
    analyze: protectedProcedure
      .input(z.object({ articleText: z.string().trim().min(40).max(20000) }))
      .mutation(async ({ input, ctx }) => {
        const started = Date.now();
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a cautious fake-news pattern analyst. Classify only linguistic and credibility patterns in the provided article. Do not claim to verify facts. Return structured JSON. The explanation must explicitly address linguistic patterns, emotional tone, credibility signals, and state that the result is pattern-based and not verified facts.",
            },
            { role: "user", content: `Analyze this article:\n\n${input.articleText}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "fake_news_analysis", strict: true, schema: predictionSchema },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : null;
        const fallback = {
          verdict: "Real" as const,
          confidence: 50,
          explanation: "The system could not produce a complete model response. This is a pattern-based result, not verified fact-checking.",
          linguisticPatterns: "Insufficient model response; inspect sentence structure and sourcing manually.",
          emotionalTone: "Insufficient model response; inspect urgency, fear, or outrage cues manually.",
          credibilitySignals: "Insufficient model response; check named sources, dates, links, and corroboration manually.",
          highlightedPhrases: ["Manual verification recommended"],
          signals: ["Insufficient model response", "Manual verification recommended"],
        };
        const result = parsed && (parsed.verdict === "Fake" || parsed.verdict === "Real") ? parsed : fallback;
        const processingTimeMs = Date.now() - started;
        await createPrediction({
          userId: ctx.user.id,
          articleText: input.articleText,
          verdict: result.verdict,
          confidence: Math.max(1, Math.min(99, Number(result.confidence))),
          processingTimeMs,
          explanation: String(result.explanation),
          linguisticPatterns: String(result.linguisticPatterns),
          emotionalTone: String(result.emotionalTone),
          credibilitySignals: String(result.credibilitySignals),
          highlightedPhrases: JSON.stringify(result.highlightedPhrases),
          signals: JSON.stringify(result.signals),
        });
        return { ...result, processingTimeMs };
      }),
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), sort: z.enum(["newest", "oldest", "confidence"]).default("newest"), verdict: z.enum(["all", "Fake", "Real"]).default("all"), minConfidence: z.number().int().min(0).max(100).optional(), maxConfidence: z.number().int().min(0).max(100).optional(), from: z.string().optional(), to: z.string().optional() }))
      .query(({ ctx, input }) => listPredictions(ctx.user.id, input)),
    stats: protectedProcedure.query(({ ctx }) => getPredictionStats(ctx.user.id)),
    remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deletePrediction(input.id, ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
