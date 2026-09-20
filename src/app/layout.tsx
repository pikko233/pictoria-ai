import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { getURL } from "@/lib/helpers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 让 OG 图片等相对路径能拼成绝对 URL，跟着 NEXT_PUBLIC_SITE_URL 走
  metadataBase: new URL(getURL()),
  title: {
    default: "Pictoria AI —— AI 写真生成平台",
    // 子页面只需写自己的标题，如 "图片生成" → "图片生成 | Pictoria AI"
    template: "%s | Pictoria AI",
  },
  description:
    "上传几张本人照片训练专属 AI 模型，从领英职业形象照到社交平台的博主大片，用一句提示词生成真实自然的个人写真。",
  keywords: [
    "AI 写真",
    "AI 生成图片",
    "职业形象照",
    "AI 头像",
    "LoRA 模型训练",
    "Flux",
  ],
  applicationName: "Pictoria AI",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Pictoria AI",
    title: "Pictoria AI —— AI 写真生成平台",
    description:
      "上传几张本人照片训练专属 AI 模型，一键生成职业形象照、社交头像与各类场景写真。",
    url: getURL(),
    // 图片由 app/opengraph-image.png 自动注入，无需在此声明
  },
  twitter: {
    card: "summary_large_image",
    title: "Pictoria AI —— AI 写真生成平台",
    description:
      "上传几张本人照片训练专属 AI 模型，一键生成职业形象照、社交头像与各类场景写真。",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
