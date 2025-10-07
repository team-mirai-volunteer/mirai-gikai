import { Langfuse } from "langfuse";

let langfuseClient: Langfuse | null = null;

export function getLangfuseClient(): Langfuse {
  if (!langfuseClient) {
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    const baseUrl =
      process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com";

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
