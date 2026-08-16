export const API_URL = (import.meta.env.VITE_FLASK_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:5000/api";

export type User = { id: string; email: string; name?: string; role: "user" | "admin" };
export type Prediction = { id: string; articleText: string; verdict: "Fake" | "Real"; confidence: number; processingTimeMs: number; explanation: string; linguisticPatterns: string; emotionalTone: string; credibilitySignals: string; highlightedPhrases: string[]; signals: string[]; createdAt?: string };
export type Stats = { total: number; fake: number; real: number; fakePercentage: number; realPercentage: number };
export type Dataset = { id: string; name: string; description: string; fileName: string; version: string; recordCount: number; fakeCount: number; realCount: number; status: "ready" | "processing" | "archived"; storage?: { provider: string; fileSize: number } };
export type Metric = { id: string; modelName: string; datasetName: string; accuracy: number; precision: number; recall: number; f1Score: number; truePositive: number; trueNegative: number; falsePositive: number; falseNegative: number; evaluatedAt?: string };

type RequestOptions = RequestInit & { auth?: boolean };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.auth !== false) {
    const token = localStorage.getItem("fake-real-token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `Request failed with status ${response.status}`);
  return body as T;
}

export const api = {
  register: (payload: { name: string; email: string; password: string }) => request<{ id: string; email: string; name: string; role: "user" }>("/auth/register", { method: "POST", body: JSON.stringify(payload), auth: false }),
  login: (payload: { email: string; password: string }) => request<{ accessToken: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(payload), auth: false }),
  me: () => request<User>("/auth/me"),
  analyze: (articleText: string) => request<Prediction>("/predictions/analyze", { method: "POST", body: JSON.stringify({ articleText }) }),
  stats: () => request<Stats>("/predictions/stats"),
  history: (params: URLSearchParams = new URLSearchParams()) => request<{ items: Prediction[] }>(`/predictions?${params.toString()}`),
  deletePrediction: (id: string) => request<{ success: boolean }>(`/predictions/${id}`, { method: "DELETE" }),
  datasets: () => request<{ items: Dataset[] }>("/admin/datasets"),
  createDataset: (payload: Record<string, unknown>) => request<Dataset>("/admin/datasets", { method: "POST", body: JSON.stringify(payload) }),
  archiveDataset: (id: string) => request<{ success: boolean }>(`/admin/datasets/${id}/archive`, { method: "PATCH" }),
  deleteDataset: (id: string) => request<{ success: boolean }>(`/admin/datasets/${id}`, { method: "DELETE" }),
  metrics: () => request<{ items: Metric[] }>("/admin/metrics"),
  createMetric: (payload: Record<string, unknown>) => request<Metric>("/admin/metrics", { method: "POST", body: JSON.stringify(payload) }),
};
