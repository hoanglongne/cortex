import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cortex/brand"],
  // Solilo was folded into Oratio (issue #89): old links land on Oratio's page
  async redirects() {
    return [{ source: "/apps/solilo", destination: "/apps/oratio", permanent: true }];
  },
};

export default nextConfig;
