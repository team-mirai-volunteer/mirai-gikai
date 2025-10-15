import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { env } from "@/lib/env";

let isInitialized = false;

/**
 * Langfuse telemetryを初期化する
 * Vercel環境ではinstrumentation.node.tsが自動起動しないため、
 * 必要な箇所で明示的に呼び出す
 *
 * @langfuse/otel + NodeTracerProviderを使用することで、
 * OpenTelemetry SDKバージョン不整合の問題を回避
 */
export async function registerNodeTelemetry() {
  if (isInitialized) {
    return;
  }

  try {
    const { publicKey, secretKey, baseUrl } = env.langfuse;

    if (!publicKey || !secretKey) {
      console.warn(
        "[Telemetry] Langfuse credentials not configured. Telemetry disabled."
      );
      return;
    }

    const langfuseSpanProcessor = new LangfuseSpanProcessor({
      publicKey,
      secretKey,
      baseUrl,
      environment: process.env.VERCEL_ENV || "development",
      exportMode: "immediate", // サーバーレス環境向け
    });

    const tracerProvider = new NodeTracerProvider({
      spanProcessors: [langfuseSpanProcessor],
    });

    tracerProvider.register();
    isInitialized = true;
  } catch (error) {
    console.error("[Telemetry] Failed to initialize Langfuse:", error);
  }
}
