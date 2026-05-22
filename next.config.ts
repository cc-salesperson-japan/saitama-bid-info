import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack が日本語パスでクラッシュするため webpack を使用
  turbopack: undefined,
};

export default nextConfig;
