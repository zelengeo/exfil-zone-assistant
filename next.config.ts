import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile in a parent directory can make Next infer the wrong workspace root. Package
  // scripts run from this directory, so make that boundary explicit for local and CI builds.
  turbopack: {
      root: process.cwd(),
  },
  // `loadDataFile` reads the generated JSON off disk when there is no origin to fetch from. Next ships
  // `public/` to the CDN but not into the function bundle, so the server half would find nothing
  // there at runtime without this. Images only need to be shipped as CDN assets.
  outputFileTracingIncludes: {
      '/**': ['./public/assets/data/*.json'],
  },
  async headers() {
      return [{
          // Only generated, content-hashed assets are immutable. Source URLs keep their
          // default revalidation policy so old clients and external consumers stay safe.
          source: '/assets/:path*',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      }];
  },
  images: {
        minimumCacheTTL: 2678400, // 31 days
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;
