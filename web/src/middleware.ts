import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createUnauthorizedResponse,
  getBasicAuthConfig,
  isPageSpeedInsights,
  validateBasicAuth,
} from "./lib/basic-auth";

export async function middleware(request: NextRequest) {
  const authConfig = getBasicAuthConfig();

  // Basic認証の設定がない場合はスキップ
  if (!authConfig) {
    return NextResponse.next();
  }

  // HTML ナビゲーションだけ認証（画像やJSON, css/js, fetch等は通す）
  if (!_isHtmlRequest(request)) return NextResponse.next();

  // PageSpeed Insightsからのアクセスは認証をスキップ
  if (isPageSpeedInsights(request)) {
    return NextResponse.next();
  }

  // Basic認証の検証
  if (validateBasicAuth(request, authConfig)) {
    return NextResponse.next();
  }

  return createUnauthorizedResponse();
}

function _isHtmlRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}
