import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Instrumentation hookを有効化（Langfuse telemetry用）
  instrumentationHook: true,
  turbopack: {
    root: "../",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/public/bill-thumbnails/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/public/bill-thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/bill-thumbnails/**",
      },
    ],
  },
};

export default nextConfig;
