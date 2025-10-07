import { LangfuseExporter } from "langfuse-vercel";
import { NodeSDK } from "@opentelemetry/sdk-node";

let isInitialized = false;

export async function registerNodeTelemetry() {
  if (isInitialized) {
    return;
  }

  try {
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    const baseUrl =
      process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com";

    if (!publicKey || !secretKey) {
      console.warn(
        "⚠️ Langfuse credentials not configured. Telemetry disabled."
      );
      return;
    }

    const langfuseExporter = new LangfuseExporter({
      publicKey,
      secretKey,
      baseUrl,
      // VERCEL_ENVを環境として使用
      environment: process.env.VERCEL_ENV || "development",
    });

    const sdk = new NodeSDK({
      traceExporter: langfuseExporter,
    });

    sdk.start();
    isInitialized = true;

    console.log("✅ Langfuse telemetry initialized");
    console.log("   Environment:", process.env.VERCEL_ENV || "development");
    console.log("   Base URL:", baseUrl);
  } catch (error) {
    console.error("❌ Failed to initialize Langfuse telemetry:", error);
  }
}
