import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pavmxbqrhjmppuofmznb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Cache optimized images for 1 year (they have content-hash URLs)
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Limit image sizes to reduce CDN costs
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Enable AVIF for better compression (smaller files = faster loading)
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Increase body size limit for server actions (file uploads)
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
