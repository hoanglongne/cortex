import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cortex/types", "@cortex/classroom", "@cortex/classroom-synapse"],
};

export default nextConfig;
