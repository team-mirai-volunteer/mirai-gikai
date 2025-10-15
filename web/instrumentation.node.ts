import { LangfuseExporter } from "langfuse-vercel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { env } from "./src/lib/env";

let isInitialized = false;
let langfuseExporter: LangfuseExporter | null = null;
let sdk: NodeSDK | null = null;

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

    langfuseExporter = new LangfuseExporter({
      publicKey,
      secretKey,
      baseUrl,
      environment: process.env.VERCEL_ENV || "development",
    });

    sdk = new NodeSDK({
      traceExporter: langfuseExporter,
    });

    sdk.start();
    isInitialized = true;
  } catch (error) {
    console.warn("⚠️ Failed to initialize Langfuse telemetry:", error);
  }
}

/**
 * Flush telemetry data to Langfuse
 * Should be called in serverless environments before function termination
 */
export async function flushTelemetry(): Promise<void> {
  if (!langfuseExporter) {
    return;
  }

  try {
    await langfuseExporter.forceFlush();
  } catch (error) {
    console.warn("⚠️ Failed to flush telemetry:", error);
  }
}
