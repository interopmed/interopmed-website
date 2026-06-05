import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: '.next-workspace',
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
