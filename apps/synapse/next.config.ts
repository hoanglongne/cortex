import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cortex/types", "@cortex/classroom", "@cortex/classroom-synapse", "@cortex/events"],
};

export default nextConfig;
