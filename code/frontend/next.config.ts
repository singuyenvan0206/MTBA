import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '../../',
  },

  allowedDevOrigins: ['192.168.0.112', '192.168.0.82', '192.168.0.95'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ]
  },
};

export default nextConfig;
