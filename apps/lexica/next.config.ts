import type { NextConfig } from "next";

// @ts-expect-error - next-pwa types are outdated for Next.js 16
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {}, // Allow webpack config from next-pwa
  transpilePackages: ['@cortex/classroom', '@cortex/classroom-lexica'],
};

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // The pronouncing dictionary loads when the speaking drill opens, and the
  // on-device scorer (onnxruntime) only when a tester downloads its pack:
  // neither belongs in the install-time precache.
  publicExcludes: ["!noprecache/**/*", "!pron/**/*"],
  buildExcludes: [/middleware-manifest\.json$/, /\.wasm$/, /ort\.wasm/],
});

export default withPWAConfig(nextConfig as Parameters<typeof withPWAConfig>[0]);
