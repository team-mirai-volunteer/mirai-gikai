import { type NextRequest, NextResponse } from "next/server";
import {
  createUnauthorizedResponse,
  getBasicAuthConfig,
  validateBasicAuth,
} from "./lib/basic-auth";

export function middleware(request: NextRequest) {
  const authConfig = getBasicAuthConfig();

  // Basic認証の設定がない場合はスキップ
  if (!authConfig) {
    return NextResponse.next();
  }

  // Basic認証の検証
  if (validateBasicAuth(request, authConfig)) {
    return NextResponse.next();
  }

  return createUnauthorizedResponse();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
