import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['sweet-hamster-legally.ngrok-free.app'],
  serverExternalPackages: [],
  output: "standalone",
};

export default nextConfig;
