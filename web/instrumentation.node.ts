/**
 * Next.js Instrumentation API for Node.js runtime
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Note: Vercel環境では自動起動しないため、各エンドポイントで明示的に呼び出す必要がある
 */
export { registerNodeTelemetry } from "./src/lib/telemetry/register";
