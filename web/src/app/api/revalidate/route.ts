import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { CACHE_TAGS, type CacheTag } from "@/lib/cache-tags";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    // Authorization header check
    const authHeader = request.headers.get("authorization");

    if (!env.revalidateSecret) {
      return NextResponse.json(
        { error: "Revalidation secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${env.revalidateSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body to get tags
    const body = await request.json();
    const tags = body.tags as CacheTag[] | undefined;

    // Validate tags
    const validTags = Object.values(CACHE_TAGS) as string[];
    const tagsToRevalidate = tags?.filter((tag) => validTags.includes(tag));

    if (!tagsToRevalidate || tagsToRevalidate.length === 0) {
      return NextResponse.json(
        { error: "No valid tags provided" },
        { status: 400 }
      );
    }

    // Revalidate each specified tag
    for (const tag of tagsToRevalidate) {
      revalidateTag(tag);
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      tags: tagsToRevalidate,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
