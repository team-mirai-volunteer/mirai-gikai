import { env } from "../env";

/**
 * Cache tags that correspond to web/src/lib/cache-tags.ts
 * Keep in sync with web application cache tags
 */
export const CACHE_TAGS = {
  BILLS: "bills",
  DIET_SESSIONS: "diet-sessions",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Invalidate specific cache tags in the web application
 * @param tags Array of cache tags to invalidate
 */
export async function invalidateWebCache(tags: CacheTag[]): Promise<void> {
  if (!env.webUrl || !env.revalidateSecret) {
    console.warn(
      "Web URL or revalidate secret not configured, skipping cache invalidation"
    );
    return;
  }

  if (!tags || tags.length === 0) {
    console.warn("No tags provided for cache invalidation");
    return;
  }

  try {
    const response = await fetch(`${env.webUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.revalidateSecret}`,
      },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cache invalidation failed: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();
    console.log("Cache invalidated successfully:", result);
  } catch (error) {
    console.error("Failed to invalidate web cache:", error);
    // Don't throw error to prevent breaking the main operation
  }
}

/**
 * Invalidate bills cache
 */
export async function invalidateBillCache(): Promise<void> {
  await invalidateWebCache([CACHE_TAGS.BILLS]);
}

/**
 * Invalidate diet sessions cache
 */
export async function invalidateDietSessionCache(): Promise<void> {
  await invalidateWebCache([CACHE_TAGS.DIET_SESSIONS]);
}
