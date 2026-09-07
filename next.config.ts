import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
        port: "",
        // Replicate 输出路径形如 /yhqm/<id>/out-0.jpg，前缀段不固定
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        // Supabase Storage 的签名 URL，形如
        // https://<ref>.supabase.co/storage/v1/object/sign/<bucket>/<path>?token=...
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,
        port: "",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
    // 本地代理为 fake-ip 模式，域名会解析到 198.18.x.x 保留网段，
    // 触发 Next 16 的 SSRF 防护。仅在开发环境放行。
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
