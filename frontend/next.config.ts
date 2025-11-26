const { createProxyMiddleware } = require('http-proxy-middleware');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy API requests to Flask backend
      },
    ];
  },
  // For development, we'll use Next.js API routes as a proxy
  async serverMiddleware() {
    const { createProxyMiddleware } = await import('http-proxy-middleware');
    const express = await import('express');
    const app = express();
    
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:5000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api',
        },
      })
    );
    
    return app;
  },
};

module.exports = nextConfig;
