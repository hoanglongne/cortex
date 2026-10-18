import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  transpilePackages: ["@cortex/classroom", "@cortex/classroom-oratio"],
  // Pin the monorepo root. Without it Next guesses from lockfiles and can
  // pick a stray one higher up (e.g. ~/pnpm-lock.yaml), then watches the
  // whole home folder and compiles very slowly.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
