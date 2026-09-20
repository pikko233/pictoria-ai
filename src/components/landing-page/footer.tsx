import Link from "next/link";
import { Button } from "../ui/button";

export const Footer = () => {
  return (
    <>
      <section className="bg-muted w-full py-16 flex flex-col items-center justify-center gap-6">
        <h2 className="sub-heading">准备好重塑你的照片了吗？</h2>
        <p className="sub-text text-center">
          加入已经在用 AI 创作惊艳图片的数千名用户。
        </p>
        <Link href="/login?state=sign-up">
          <Button size="lg">✨ 创建你的第一个模型 ✨</Button>
        </Link>
      </section>
      <footer className="w-full mx-auto px-6 bg-muted flex flex-col md:flex-row gap-4 pb-16 sm:pb-6 items-center justify-between">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Pictoria AI Inc. 保留所有权利。
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="#"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            服务条款
          </Link>
          <Link
            href="#"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            隐私政策
          </Link>
        </nav>
      </footer>
    </>
  );
};
