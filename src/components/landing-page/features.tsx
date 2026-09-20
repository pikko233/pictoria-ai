"use client";

import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "../ui/animated-gradient-text";
import { ImageIcon, Package2, Palette } from "lucide-react";
import dashboardImg from "@/public/dashboard-img.png";
import Image from "next/image";

const featureList = [
  {
    title: "AI 驱动的照片生成",
    description:
      "借助 AI 的力量，瞬间把你的照片变成高质量、栩栩如生的图片。无论是社交媒体上的新鲜素材、领英上的职业形象照，还是个人项目里的趣味图集，都能轻松搞定。",
    icon: <ImageIcon className="w-6 h-6" strokeWidth={1.5} />,
  },
  {
    title: "海量风格包，随手就能用",
    description:
      "不必再花上几个小时布景打光。60 多种预设风格包，从经典的商务证件照到时下流行的街拍风，一键就能拍出你想要的氛围与情绪。",
    icon: <Package2 className="w-6 h-6" strokeWidth={1.5} />,
  },
  {
    title: "可自定义的图片生成",
    description:
      "让每一张图片都贴合你的个人或品牌风格。训练专属于你的 AI 模型后，你可以轻松调整姿势、表情乃至背景设置，呈现完全符合你独特审美的视觉效果。",
    icon: <Palette className="w-6 h-6" strokeWidth={1.5} />,
  },
];

export const Features = () => {
  return (
    <section
      id="features"
      className="w-full bg-muted flex flex-col items-center justify-center py-32 px-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full lg:container mx-auto relative">
        <div className="col-span-full space-y-4">
          <div className="group pointer-events-auto relative rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-all duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] w-fit">
            <span
              className={cn(
                "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-linear-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-size-[300%_100%] p-px",
              )}
              style={{
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "subtract",
                WebkitClipPath: "padding-box",
              }}
            />
            <AnimatedGradientText className="text-sm font-medium">
              功能特性
            </AnimatedGradientText>
          </div>
          <h2 className="sub-heading">用 Pictoria AI 解锁无限可能</h2>
          <p className="sub-text">
            我们的平台提供丰富的功能，只为让你的图片创作体验更上一层楼。从简单易用的编辑工具，到强大的
            AI 图片生成能力，把你的创意变成现实所需的一切，这里都有。
          </p>
        </div>
        <div className="flex flex-col items-start justify-start gap-6 order-2 lg:order-1">
          {featureList.map((feature, index) => (
            <div key={index} className="p-4 flex items-start gap-4">
              <span className="p-2 rounded-md text-foreground sm:text-background bg-transparent sm:bg-foreground">
                {feature.icon}
              </span>
              <div>
                <h3 className="text-xl lg:text-2xl font-medium">
                  {feature.title}
                </h3>
                <p className="text-sm lg:text-lg text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div
          className={cn(
            "order-1 lg:order-2 h-fit md:sticky top-32 pl-16 pt-16 rounded-lg overflow-hidden border border-r-gray-300 border-b-gray-300 animate-gradient bg-linear-to-r from-[#627FAB] via-[#B95480] to-[#627FAB] bg-size-[var(--bg-size)_100%] [--bg-size:400%]",
          )}
        >
          <Image
            src={dashboardImg}
            alt="功能预览图"
            className="w-full h-auto rounded-tl-lg"
          />
        </div>
      </div>
    </section>
  );
};
