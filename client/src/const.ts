import { buildOAuthLoginUrl, encodeOAuthState, getOAuthStateCookieName } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export type RuntimeAuthConfig = {
  appId: string;
  oauthPortalUrl: string;
  localDemoEnabled: boolean;
};

// Keep this build-time value for compatibility with existing consumers, but the
// login page prefers the runtime server response so hosted builds do not make
// an auth decision from stale or missing Vite variables.
export const hasOAuthConfig = Boolean(import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID);

export const isLocalDevelopmentHost = () => {
  if (typeof window === "undefined") return import.meta.env.MODE === "development";
  return ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
};

export const startLocalDemoLogin = () => {
  if (import.meta.env.MODE === "production") {
    throw new Error("Local demo login is disabled in production builds.");
  }
  if (!isLocalDevelopmentHost()) {
    throw new Error("Local demo login is available only on localhost.");
  }
  window.location.href = "/api/auth/local-demo";
};

export const startLogin = (runtimeConfig?: Partial<RuntimeAuthConfig>) => {
  const oauthPortalUrl = runtimeConfig?.oauthPortalUrl || import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = runtimeConfig?.appId || import.meta.env.VITE_APP_ID;
  if (!oauthPortalUrl || !appId) {
    throw new Error("OAuth is not configured for this application. Set VITE_APP_ID and VITE_OAUTH_PORTAL_URL, then restart the server.");
  }
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  const isSecure = window.location.protocol === "https:";
  const cookieAttributes = `Path=/; Max-Age=600; SameSite=${isSecure ? "None" : "Lax"}${isSecure ? "; Secure" : ""}`;
  const stateCookieName = getOAuthStateCookieName(isSecure);
  document.cookie = `${stateCookieName}=${nonce}; ${cookieAttributes}`;
  const state = encodeOAuthState({ redirectUri, nonce });

  window.location.href = buildOAuthLoginUrl({ oauthPortalUrl, appId, redirectUri, state });
};
