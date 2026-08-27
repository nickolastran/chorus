import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" }, // Spotify album art
      { protocol: "https", hostname: "**.ticketm.net" }, // Ticketmaster event art
    ],
  },
};

export default nextConfig;
