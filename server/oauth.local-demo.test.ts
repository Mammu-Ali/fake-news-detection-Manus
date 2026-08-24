import { describe, expect, it } from "vitest";
import { registerOAuthRoutes } from "./_core/oauth";

describe("local demo login", () => {
  it("creates a development session and redirects to the dashboard root", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const routes = new Map<string, (req: any, res: any) => Promise<void>>();
    registerOAuthRoutes({
      get: (path: string, handler: (req: any, res: any) => Promise<void>) => routes.set(path, handler),
    } as any);

    const response = {
      cookies: [] as unknown[],
      redirects: [] as string[],
      cookie(name: string, value: string) {
        this.cookies.push({ name, value });
      },
      redirect(_status: number, location: string) {
        this.redirects.push(location);
      },
    };

    await routes.get("/api/auth/local-demo")?.({ protocol: "http", hostname: "localhost", headers: {} }, response);

    expect(response.cookies).toHaveLength(1);
    expect(response.redirects).toEqual(["/dashboard"]);
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("rejects hosted origins", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const routes = new Map<string, (req: any, res: any) => Promise<void>>();
    registerOAuthRoutes({
      get: (path: string, handler: (req: any, res: any) => Promise<void>) => routes.set(path, handler),
    } as any);
    const response = {
      statusCode: 0,
      body: null as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: unknown) {
        this.body = body;
      },
    };
    await routes.get("/api/auth/local-demo")?.({ hostname: "preview.manus.computer", headers: {} }, response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: "Local demo login is available only on localhost." });
    process.env.NODE_ENV = previousNodeEnv;
  });
});
