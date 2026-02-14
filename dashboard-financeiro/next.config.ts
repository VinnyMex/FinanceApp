
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  webpack: (config: any) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    });
    return config;
  },
};

export default withPWA(nextConfig);
