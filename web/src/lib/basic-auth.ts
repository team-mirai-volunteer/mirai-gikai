import type { NextRequest } from "next/server";

export interface BasicAuthConfig {
  username: string;
  password: string;
}

export function getBasicAuthConfig(): BasicAuthConfig | null {
  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

export function parseBasicAuth(
  authHeader: string
): { username: string; password: string } | null {
  try {
    const authValue = authHeader.split(" ")[1];
    if (!authValue) return null;

    const [username, password] = atob(authValue).split(":");
    return { username, password };
  } catch {
    return null;
  }
}

export function isPageSpeedInsights(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || "";

  // PageSpeed Insights の User-Agent パターンをチェック
  return (
    userAgent.includes("Chrome-Lighthouse") ||
    userAgent.includes("PageSpeed Insights") ||
    userAgent.includes("Google Page Speed Insights")
  );
}

export function validateBasicAuth(
  request: NextRequest,
  config: BasicAuthConfig
): boolean {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const credentials = parseBasicAuth(authHeader);
  if (!credentials) {
    return false;
  }

  return (
    credentials.username === config.username &&
    credentials.password === config.password
  );
}

export function createUnauthorizedResponse(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="Secure Area"`,
    },
  });
}
