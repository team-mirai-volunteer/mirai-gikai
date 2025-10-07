import type { NextRequest } from "next/server";
import {
  createUnauthorizedResponse,
  getBasicAuthConfig,
  isPageSpeedInsights,
  validateBasicAuth,
} from "./lib/basic-auth";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const authConfig = getBasicAuthConfig();

  // Basic認証の設定がない場合はスキップ
  if (!authConfig) {
    return updateSession(request);
  }

  // HTML ナビゲーションだけ認証（画像やJSON, css/js, fetch等は通す）
  if (!_isHtmlRequest(request)) return updateSession(request);

  // PageSpeed Insightsからのアクセスは認証をスキップ
  if (isPageSpeedInsights(request)) {
    return updateSession(request);
  }

  // Basic認証の検証
  if (validateBasicAuth(request, authConfig)) {
    return updateSession(request);
  }

  return createUnauthorizedResponse();
}

function _isHtmlRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}
