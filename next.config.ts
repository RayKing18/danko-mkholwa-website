import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photo uploads from the Upload Centre / gallery go through Server Actions.
  // The default limit is 1 MB, so we raise it to comfortably fit 5 MB images.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  // sharp is a native module used to generate PWA icons — keep it out of the bundle.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
