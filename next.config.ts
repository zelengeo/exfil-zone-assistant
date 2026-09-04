import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A lockfile in a parent directory can make Next infer the wrong workspace root. Package
  // scripts run from this directory, so make that boundary explicit for local and CI builds.
  turbopack: {
      root: process.cwd(),
  },
  // `loadDataFile` reads public/data off disk when there is no origin to fetch from. Next ships
  // `public/` to the CDN but not into the function bundle, so the server half would find nothing
  // there at runtime without this; 3.2 MB against a 250 MB bundle limit.
  outputFileTracingIncludes: {
      '/**': ['./public/data/**/*.json'],
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
