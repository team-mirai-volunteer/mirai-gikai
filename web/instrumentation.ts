import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";
import { env } from "./src/lib/env";

export async function register() {
  // Node.js環境でのみ実行（Edge Runtimeではスキップ）
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { publicKey, secretKey, baseUrl } = env.langfuse;

      if (!publicKey || !secretKey) {
        console.warn(
          "⚠️ Langfuse credentials not configured. Telemetry disabled."
        );
        return;
      }

      registerOTel({
        serviceName: "mirai-gikai-web",
        traceExporter: new LangfuseExporter({
          publicKey,
          secretKey,
          baseUrl,
          environment: process.env.VERCEL_ENV || "development",
        }),
      });
    } catch (error) {
      console.warn("⚠️ Failed to initialize Langfuse telemetry:", error);
    }
  }
}
