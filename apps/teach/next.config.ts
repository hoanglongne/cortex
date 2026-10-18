import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cortex/classroom", "@cortex/classroom-lexica"],
};

export default nextConfig;
