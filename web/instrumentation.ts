export async function register() {
  // Node.js環境でのみ実行（Edge Runtimeではスキップ）
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 動的インポートでNode.js専用パッケージを読み込む
    const { registerNodeTelemetry } = await import("./instrumentation.node");
    await registerNodeTelemetry();
  }
}
