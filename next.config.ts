import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  distDir: '.next',
  async redirects() {
    if (process.env.NODE_ENV !== 'development') {
      return []
    }

    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '127.0.0.1',
          },
        ],
        destination: 'http://localhost:3000/:path*',
        permanent: false,
      },
    ]
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
