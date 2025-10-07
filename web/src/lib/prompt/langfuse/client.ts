import { Langfuse } from "langfuse";
import { env } from "@/lib/env";

let langfuseClient: Langfuse | null = null;

export function getLangfuseClient(): Langfuse {
  if (!langfuseClient) {
    const { publicKey, secretKey, baseUrl } = env.langfuse;

    if (!publicKey || !secretKey) {
      throw new Error(
        "Langfuse credentials not configured. Set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY"
      );
    }

    langfuseClient = new Langfuse({
      publicKey,
      secretKey,
      baseUrl,
      release: process.env.VERCEL_ENV || "development",
    });
  }

  return langfuseClient;
}
