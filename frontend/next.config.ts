import type { NextConfig } from "next";
import { createProxyMiddleware } from "http-proxy-middleware";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Don't proxy API/auth routes
        {
          source: '/api/auth/:path*',
          destination: '/api/auth/:path*',
        },
        // Proxy other API routes to your backend
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*', // Adjust the port if needed
        },
      ],
    };
  },
  async serverMiddleware() {
    const proxy = createProxyMiddleware({
      target: 'http://localhost:5000', // Your backend URL
      changeOrigin: true,
      pathRewrite: { '^/api': '' }, // Remove /api prefix when forwarding
      logLevel: 'debug',
    });

    return {
      '/api': proxy,
    };
  },
};

export default nextConfig;