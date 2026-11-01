import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cortex/classroom", "@cortex/classroom-lexica", "@cortex/classroom-oratio", "@cortex/classroom-synapse"],
};

export default nextConfig;
