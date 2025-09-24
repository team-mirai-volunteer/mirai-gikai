import { isRedirectError } from "next/dist/client/components/redirect-error";

export function isNextRedirectError(error: unknown): boolean {
  return isRedirectError(error);
}
