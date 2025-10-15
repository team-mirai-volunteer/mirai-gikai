import { LangfuseExporter } from "langfuse-vercel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { env } from "@/lib/env";

let isInitialized = false;

/**
 * Langfuse telemetryを初期化する
 * Vercel環境ではinstrumentation.node.tsが自動起動しないため、
 * 必要な箇所で明示的に呼び出す
 */
export async function registerNodeTelemetry() {
  if (isInitialized) {
    console.log("[Telemetry] Already initialized, skipping");
    return;
  }

  console.log("[Telemetry] Starting initialization...", {
    environment: process.env.VERCEL_ENV || "development",
    nodeVersion: process.version,
  });

  try {
    const { publicKey, secretKey, baseUrl } = env.langfuse;

    if (!publicKey || !secretKey) {
      console.warn(
        "[Telemetry] Langfuse credentials not configured. Telemetry disabled.",
        {
          hasPublicKey: !!publicKey,
          hasSecretKey: !!secretKey,
          baseUrl,
        }
      );
      return;
    }

    console.log("[Telemetry] Creating LangfuseExporter...", {
      baseUrl,
      environment: process.env.VERCEL_ENV || "development",
    });

    const langfuseExporter = new LangfuseExporter({
      publicKey,
      secretKey,
      baseUrl,
      environment: process.env.VERCEL_ENV || "development",
    });

    console.log("[Telemetry] Creating NodeSDK...");
    const sdk = new NodeSDK({
      traceExporter: langfuseExporter,
    });

    console.log("[Telemetry] Starting SDK...");
    sdk.start();
    isInitialized = true;
    console.log("[Telemetry] Initialization completed successfully");
  } catch (error) {
    console.error("[Telemetry] Failed to initialize Langfuse:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
