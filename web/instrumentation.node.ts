import { LangfuseExporter } from "langfuse-vercel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { env } from "./src/lib/env";

let isInitialized = false;

export async function registerNodeTelemetry() {
  console.log("🔧 [Telemetry] registerNodeTelemetry called");

  if (isInitialized) {
    console.log("✅ [Telemetry] Already initialized, skipping");
    return;
  }

  try {
    const { publicKey, secretKey, baseUrl } = env.langfuse;

    console.log("🔍 [Telemetry] Langfuse config:", {
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      baseUrl,
      environment: process.env.VERCEL_ENV || "development",
    });

    if (!publicKey || !secretKey) {
      console.warn(
        "⚠️ Langfuse credentials not configured. Telemetry disabled."
      );
      return;
    }

    console.log("🚀 [Telemetry] Initializing LangfuseExporter...");
    const langfuseExporter = new LangfuseExporter({
      publicKey,
      secretKey,
      baseUrl,
      environment: process.env.VERCEL_ENV || "development",
    });

    console.log("🚀 [Telemetry] Initializing NodeSDK...");
    const sdk = new NodeSDK({
      traceExporter: langfuseExporter,
    });

    console.log("🚀 [Telemetry] Starting SDK...");
    sdk.start();
    isInitialized = true;
    console.log("✅ [Telemetry] Initialization complete!");
  } catch (error) {
    console.warn("⚠️ Failed to initialize Langfuse telemetry:", error);
  }
}
