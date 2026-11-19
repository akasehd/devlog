import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Posts are compiled at build time from files on disk.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};

export default nextConfig;
