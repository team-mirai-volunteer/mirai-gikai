/**
 * Next.js cache tags for revalidation
 */
export const CACHE_TAGS = {
  BILLS: "bills",
  DIET_SESSIONS: "diet-sessions",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
