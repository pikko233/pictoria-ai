/* eslint-disable react-hooks/purity */
import { ChevronRight } from "lucide-react";
import { AnimatedGradientText } from "../ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "../ui/button";
import { Marquee } from "../ui/marquee";
import img1 from "@/public/hero-images/Charismatic Young Man with a Warm Smile and Stylish Tousled Hair.jpeg";
import img2 from "@/public/hero-images/Confident Businesswoman on Turquoise Backdrop.jpeg";
import img3 from "@/public/hero-images/Confident Woman in Red Outfit.jpeg";
import img4 from "@/public/hero-images/Confident Woman in Urban Setting.jpeg";
import img5 from "@/public/hero-images/Futuristic Helmet Portrait.jpeg";
import img6 from "@/public/hero-images/Futuristic Woman in Armor.jpeg";
import img7 from "@/public/hero-images/Man in Brown Suit.jpeg";
import img8 from "@/public/hero-images/Poised Elegance of a Young Professional.jpeg";
import img9 from "@/public/hero-images/Professional Business Portrait.jpeg";
import img10 from "@/public/hero-images/Professional Woman in Navy Blue Suit.jpeg";
import img11 from "@/public/hero-images/Sophisticated Businessman Portrait.jpeg";
import Image from "next/image";

const avatars = [
  {
    src: "/avatars/AutumnTechFocus.jpeg",
    fallback: "CN",
  },
  {
    src: "/avatars/Casual Creative Professional.jpeg",
    fallback: "AB",
  },
  {
    src: "/avatars/Golden Hour Contemplation.jpeg",
    fallback: "FG",
  },
  {
    src: "/avatars/Portrait of a Woman in Rust-Colored Top.jpeg",
    fallback: "PW",
  },
  {
    src: "/avatars/Radiant Comfort.jpeg",
    fallback: "RC",
  },
  {
    src: "/avatars/Relaxed Bearded Man with Tattoo at Cozy Cafe.jpeg",
    fallback: "RB",
  },
];

const Images = [
  {
    src: img1,
    alt: "AI 生成的图片",
  },
  {
    src: img2,
    alt: "AI 生成的图片",
  },
  {
    src: img3,
    alt: "AI 生成的图片",
  },
  {
    src: img4,
    alt: "AI 生成的图片",
  },
  {
    src: img5,
    alt: "AI 生成的图片",
  },
  {
    src: img6,
    alt: "AI 生成的图片",
  },
  {
    src: img7,
    alt: "AI 生成的图片",
  },
  {
    src: img8,
    alt: "AI 生成的图片",
  },
  {
    src: img9,
    alt: "AI 生成的图片",
  },
  {
    src: img10,
    alt: "AI 生成的图片",
  },
  {
    src: img11,
    alt: "AI 生成的图片",
  },
];

const MarqueeColumn = ({
  reverse,
  duration,
  className,
}: {
  reverse: boolean;
  duration: number;
  className?: string;
}) => {
  return (
    <Marquee
      reverse={reverse}
      pauseOnHover
      vertical
      className={cn(
        "relative w-full h-full flex flex-col items-center justify-center",
        className,
      )}
      // React.CSSProperties 不接受 CSS 自定义属性，需要断言；单位不能省，
      // 否则 animation-duration 是无效值
      style={{ "--duration": `${duration}s` } as React.CSSProperties}
    >
      {Images.sort(() => Math.random() - 0.5).map((image, index) => (
        <Image
          key={index}
          src={image.src}
          alt={image.alt}
          priority
          className="w-full h-full object-cover rounded opacity-25 hover:opacity-100 transition-opacity duration-300 ease-in-out"
        />
      ))}
    </Marquee>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* 装饰层：必须排在内容之前且不带 z-index，否则会盖住内容、
          让按钮上的 hover 命中图片 */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <MarqueeColumn reverse={true} duration={120} />
        <MarqueeColumn reverse={false} duration={120} />
        <MarqueeColumn
          reverse={true}
          duration={120}
          className="hidden md:flex"
        />
        <MarqueeColumn
          reverse={false}
          duration={120}
          className="hidden lg:flex"
        />
        <MarqueeColumn
          reverse={true}
          duration={120}
          className="hidden lg:flex"
        />
      </div>

      {/* 内容层在上。整层不接收指针事件，好让空白处的 hover 能穿透到图片；
          可交互和需要选中的元素再单独打开 */}
      <div className="relative z-10 pointer-events-none flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6">
        <div>
          <div className="group pointer-events-auto relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-all duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] bg-card/50 hover:bg-card">
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
            🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
            <AnimatedGradientText className="text-sm font-medium">
              体验更多 Flux 模型
            </AnimatedGradientText>
            <ChevronRight className="ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </div>
        </div>
        <h1 className="pointer-events-auto text-2xl md:text-4xl font-black tracking-tight text-center">
          用 AI 的力量，重塑你的照片
        </h1>
        <p className="pointer-events-auto text-sm md:text-lg text-center text-muted-foreground">
          从领英职业形象照到社交平台的博主大片，Pictoria AI
          的前沿技术让你始终以最好的状态出镜。创作、编辑、生成图片，轻松搞定。
        </p>
        <div className="pointer-events-auto flex items-center gap-4">
          <AvatarGroup>
            {avatars.map((avatar, index) => (
              <Avatar key={index}>
                <AvatarImage src={avatar.src} alt="用户头像" />
                <AvatarFallback>{avatar.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <span className="text-sm font-medium text-muted-foreground">
            已获 1000+ 用户喜爱
          </span>
        </div>
        <Link href="/login?state=sign-up" className="pointer-events-auto">
          <Button className="rounded-md h-12">✨ 创建你的第一个模型 ✨</Button>
        </Link>
      </div>
    </section>
  );
};
