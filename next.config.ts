import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the black "N" dev-mode badge (bottom-left) — it sat over page
  // content in development. Compile/runtime errors still surface.
  devIndicators: false,
  // three ships ESM; transpiling keeps drei/fiber examples tree-shakable.
  transpilePackages: ["three"],
};

export default nextConfig;
