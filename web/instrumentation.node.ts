import { LangfuseExporter } from "langfuse-vercel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { env } from "./src/lib/env";

let isInitialized = false;

export async function registerNodeTelemetry() {
  if (isInitialized) {
    return;
  }

  try {
    const { publicKey, secretKey, baseUrl } = env.langfuse;

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
      environment: process.env.VERCEL_ENV || "development",
    });

    const sdk = new NodeSDK({
      traceExporter: langfuseExporter,
    });

    sdk.start();
    isInitialized = true;
  } catch (error) {
    console.warn("⚠️ Failed to initialize Langfuse telemetry:", error);
  }
}
