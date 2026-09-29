import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["onnxruntime-node", "sharp", "ws"],
  outputFileTracingIncludes: {
    "/api/identify": [
      "./models/Xenova/resnet-50/**/*",
      // onnxruntime-node selects its native binding dynamically and changes the
      // N-API directory between releases, so trace every Linux x64 binding.
      "./node_modules/onnxruntime-node/bin/*/linux/x64/**/*",
    ],
  },
  outputFileTracingExcludes: {
    // Local development may read this ignored file, but a private signer must
    // never be copied into a production function bundle.
    "/api/identify": ["./.wildquest-keys/**/*"],
  },
  turbopack: {
    root: __dirname,
    resolveAlias: {
      fs: { browser: "./empty-module.js" },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
  async rewrites() {
    return [
      // UI assets backwards compatibility
      { source: "/creatures/logo.png", destination: "/ui/logo.png" },
      { source: "/creatures/nav_bar.png", destination: "/ui/nav_bar.png" },
      { source: "/creatures/button.png", destination: "/ui/button.png" },
      {
        source: "/creatures/button_tab.png",
        destination: "/ui/button_tab.png",
      },
      // Card assets backwards compatibility
      {
        source: "/creatures/background_wildcard.png",
        destination: "/cards/back/background_wildcard.png",
      },
      {
        source: "/creatures/:rarity(common|uncommon|rare|epic|legend).png",
        destination: "/cards/frames/:rarity.webp",
      },
      // Creature artwork backwards compatibility
      {
        source: "/creatures/:file([a-z0-9_-]+).png",
        destination: "/creatures/artwork/:file.webp",
      },
      // Creature vector icons backwards compatibility
      {
        source: "/creatures/:file([a-z0-9_-]+\\.svg)",
        destination: "/creatures/icons/:file",
      },
    ];
  },
};

export default nextConfig;
