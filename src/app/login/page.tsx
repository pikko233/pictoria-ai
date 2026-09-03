import { AuthForm } from "@/components/auth/auth-form";
import AuthImg from "../../../public/Abstract Curves and Colors.jpeg";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Image from "next/image";

const Page = () => {
  return (
    <main className="h-screen grid md:grid-cols-2 relative">
      {/* 左侧背景图片 */}
      <div className="relative w-full hidden md:flex flex-col bg-muted p-10 text-primary-foreground">
        <div className="absolute z-20 left-0 top-0 w-full h-[30%] bg-linear-to-t from-transparent to-black/50"></div>
        <div className="absolute z-20 left-0 bottom-0 w-full h-[30%] bg-linear-to-b from-transparent to-black/50"></div>
        <Image
          src={AuthImg}
          alt="login image"
          fill
          className="w-full h-full object-cover"
        />
        <div className="relative z-20 flex w-full items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              “Pictoria AI is a game changer for me. I have been able to
              generate high quality professional headshots within minutes. It
              has saved me countless hours of work and cost as well.”
            </p>
            <footer className="text-sm">David S.</footer>
          </blockquote>
        </div>
      </div>
      {/* 右侧登录/注册表单 */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center p-8">
        <div className="w-[90%] max-w-xs">
          <AuthForm />
        </div>
      </div>
    </main>
  );
};

export default Page;
