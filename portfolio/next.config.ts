import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Inlined identically into server and client bundles (see Footer's useCurrentYear)
    BUILD_YEAR: String(new Date().getFullYear()),
  },
};

export default nextConfig;
