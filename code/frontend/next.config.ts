import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), '../../'),
  },

  allowedDevOrigins: ['192.168.0.112', '192.168.0.82', '192.168.0.24', '127.0.0.1', 'localhost'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
    ]
  },
};

export default nextConfig;
