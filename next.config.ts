import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
