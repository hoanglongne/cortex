import type { NextConfig } from "next";

// @ts-expect-error - next-pwa types are outdated for Next.js 16
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {}, // Allow webpack config from next-pwa
  transpilePackages: ['@cortex/classroom', '@cortex/classroom-lexica', '@cortex/brand'],
  // The old link challenges (/challenge/<id>) are gone; their links land on the games
  // The speed lab needs cross-origin isolation (multi-threaded WASM); nothing else in the app does
  async headers() {
    return [{ source: '/tts-lab.html', headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }, { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }] }];
  },
  async redirects() {
    return [{ source: '/challenge/:id', destination: '/play', permanent: false }];
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // The pronouncing dictionary loads when the speaking drill opens, and the
  // on-device scorer (onnxruntime) only when a tester downloads its pack:
  // neither belongs in the install-time precache.
  publicExcludes: ["!noprecache/**/*", "!pron/**/*", "!tts-lab.html"],
  buildExcludes: [/middleware-manifest\.json$/, /\.wasm$/, /ort\.wasm/],
  // Push notifications: the handlers for "push" and "notificationclick" (docs/LEXICA_PUSH_SPEC.md)
  importScripts: ["/push-sw.js"],
});

export default withPWAConfig(nextConfig as Parameters<typeof withPWAConfig>[0]);
