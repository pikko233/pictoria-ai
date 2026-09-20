import type { NextConfig } from "next";

// next.config.ts 在构建最开始就会被加载执行，这里缺变量会让整个 build
// 以一句没有上下文的 "Invalid URL" 失败。显式检查，把问题说清楚。
const supabaseHostname = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL，无法配置 images.remotePatterns。" +
        "本地请检查 .env.local，线上请在 Vercel 环境变量中配置。",
    );
  }
  return new URL(raw).hostname;
})();

const nextConfig: NextConfig = {
  // standalone 是给自托管（Docker 等）用的产物形态，Vercel 有自己的
  // output 处理，构建时置空避免多余产物。
  output: process.env.VERCEL ? undefined : "standalone",
  devIndicators: false,
  // 通过 ngrok 访问 dev server 时，Next 默认会拦截跨源的 /_next、/__nextjs_*
  // 资源（返回 403 Unauthorized），HMR 长连接也会被拒。放行 ngrok 域名。
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"],
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
        hostname: supabaseHostname,
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
