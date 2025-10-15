import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { env } from "@/lib/env";

let isInitialized = false;

/**
 * Langfuse telemetryを初期化
 * instrumentation.tsが動作しないため、手動初期化を使用
 */
export function initializeLangfuseTelemetry() {
  // 既に初期化済みの場合はスキップ
  if (isInitialized) {
    console.log("⏭️ Langfuse telemetry already initialized, skipping");
    return;
  }

  console.log("🚀 Manual Langfuse telemetry initialization started");

  try {
    const { publicKey, secretKey, baseUrl } = env.langfuse;

    if (!publicKey || !secretKey) {
      console.warn(
        "⚠️ Langfuse credentials not configured. Telemetry disabled."
      );
      return;
    }

    console.log("🔧 Initializing Langfuse telemetry...");
    console.log(`📍 Environment: ${process.env.VERCEL_ENV || "development"}`);
    console.log(`📍 Base URL: ${baseUrl}`);

    // Next.jsのインフラストラクチャスパンをフィルタリング（オプション）
    const shouldExportSpan = (span: any) => {
      const scopeName = span.otelSpan?.instrumentationScope?.name;
      // Next.jsの内部スパンは除外
      if (scopeName === "next.js") {
        return false;
      }
      return true;
    };

    const langfuseSpanProcessor = new LangfuseSpanProcessor({
      publicKey,
      secretKey,
      baseUrl,
      environment: process.env.VERCEL_ENV || "development",
      shouldExportSpan,
      // サーバーレス環境では即座にエクスポート
      exportMode: "immediate",
    });

    const tracerProvider = new NodeTracerProvider({
      spanProcessors: [langfuseSpanProcessor],
    });

    tracerProvider.register();

    // 自動計装を登録
    registerInstrumentations({
      tracerProvider,
      instrumentations: [],
    });

    isInitialized = true;
    console.log("✅ Langfuse telemetry initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Langfuse telemetry:", error);
    // エラー詳細を出力
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }
  }
}
