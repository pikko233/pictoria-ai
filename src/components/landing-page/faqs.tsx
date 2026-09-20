import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "../ui/animated-gradient-text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqsList = [
  {
    question: "Pictoria AI 是如何工作的？",
    answer:
      "Pictoria AI 使用先进的机器学习算法分析并理解你上传的照片，再根据你的外貌特征和所选场景生成全新的图片，输出真实自然、专属于你的效果。",
  },
  {
    question: "我的数据在 Pictoria AI 上安全吗？",
    answer:
      "安全。我们非常重视数据隐私，所有上传的照片和生成的图片都会加密并安全存储。未经你的明确同意，我们绝不会把你的个人数据或图片分享给任何第三方。",
  },
  {
    question: "上传多少张照片才能获得最好的效果？",
    answer:
      "为了达到最佳效果，我们建议至少上传 10-20 张风格多样的个人照片。这能帮助 AI 模型更好地理解你的外貌特征和表情，从而生成更准确、更逼真的图片。",
  },
  {
    question: "我可以把 Pictoria AI 用于商业用途吗？",
    answer:
      "可以。专业版和企业版套餐包含所生成图片的商业使用授权。但请注意，使用 AI 生成的图片时，你仍需遵守相关的版权和隐私法律法规。",
  },
  {
    question: "AI 模型多久更新一次？",
    answer:
      "我们会持续优化 AI 模型。重大版本通常每季度发布一次，小幅改进和优化则更加频繁。所有用户都会自动享受到这些更新。",
  },
  {
    question: "免费版和付费版有什么区别？",
    answer:
      "免费版每天最多可生成 5 张图片。专业版包含无限次图片生成、更高分辨率的输出以及更多进阶功能。企业版面向企业客户，提供定制化集成和专属支持。",
  },
];

export const Faqs = () => {
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
          常见问题
        </AnimatedGradientText>
      </div>
      <h2 className="sub-heading">常见问题解答</h2>
      <p className="sub-text max-w-xs lg:max-w-3xl text-center">
        这里汇总了用户关于我们产品最常问到的一些问题。
      </p>
      <Accordion defaultValue={[]} className="max-w-xs md:max-w-lg lg:max-w-xl">
        {faqsList.map((faq, index) => (
          <AccordionItem key={index} value={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
