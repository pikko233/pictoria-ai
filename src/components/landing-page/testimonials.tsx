import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "../ui/animated-gradient-text";
import { Marquee } from "../ui/marquee";
import Image, { type StaticImageData } from "next/image";
import avatar1 from "@/public/avatars/AutumnTechFocus.jpeg";
import avatar2 from "@/public/avatars/Casual Creative Professional.jpeg";
import avatar3 from "@/public/avatars/Golden Hour Contemplation.jpeg";
import avatar4 from "@/public/avatars/Portrait of a Woman in Rust-Colored Top.jpeg";
import avatar5 from "@/public/avatars/Radiant Comfort.jpeg";
import avatar6 from "@/public/avatars/Relaxed Bearded Man with Tattoo at Cozy Cafe.jpeg";

const reviews = [
  {
    name: "Jack Smith",
    username: "@jacksmith",
    body: "生成的社交头像彻底改变了我的线上形象，匹配率提升了一大截。真的是革命性的产品！",
    img: avatar1,
  },
  {
    name: "Jill Smith",
    username: "@jillsmith",
    body: "出来的效果让我彻底惊艳了，完全超出我的预期。太棒了！",
    img: avatar2,
  },
  {
    name: "John Doe",
    username: "@johndoe",
    body: "用它生成领英头像是我做过最正确的决定。成片质量非常出色，我还因此拿到了好几个 offer！",
    img: avatar3,
  },
  {
    name: "Jane Doe",
    username: "@janedoe",
    body: "结果好到我都不知道该怎么形容了，这个产品简直太出色，我爱了！",
    img: avatar4,
  },
  {
    name: "Jenny Mandell",
    username: "@jennymandell",
    body: "我真的找不到词来形容有多惊喜，这个服务非常了不起，太喜欢了！",
    img: avatar5,
  },
  {
    name: "James Cameron",
    username: "@jamescameron",
    body: "照片的质量让我由衷赞叹。对任何想提升个人形象的人来说，它都是颠覆性的存在！",
    img: avatar6,
  },
];
const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);
const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: StaticImageData;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <Image
          className="rounded-full"
          width={32}
          height={32}
          alt=""
          src={img}
          placeholder="blur"
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="w-full bg-background flex flex-col items-center justify-center py-32 px-0 lg:px-8 overflow-hidden gap-6"
    >
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
          用户评价
        </AnimatedGradientText>
      </div>
      <h2 className="sub-heading">用户怎么说</h2>
      <p className="sub-text max-w-xs lg:max-w-3xl text-center">
        从领英职业形象照到活力十足的社交媒体内容，看看为什么成千上万的用户都选择
        Pictoria AI 来轻松生成高质量图片。
      </p>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
      </div>
    </section>
  );
};
