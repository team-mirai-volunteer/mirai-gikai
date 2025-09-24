import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { CACHE_TAGS } from "@/lib/cache-tags";
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

    revalidateTag(CACHE_TAGS.BILLS);

    return NextResponse.json({
      success: true,
      revalidated: true,
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
