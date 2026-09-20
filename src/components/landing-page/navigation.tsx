import Link from "next/link";
import { Logo } from "../logo";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Menu } from "lucide-react";

const NavItems = () => {
  return (
    <>
      <Link
        href="#features"
        className="text-sm font-medium hover:underline underline-offset-4"
      >
        功能
      </Link>
      <Link
        href="#pricing"
        className="text-sm font-medium hover:underline underline-offset-4"
      >
        价格
      </Link>
      <Link
        href="#FAQs"
        className="text-sm font-medium hover:underline underline-offset-4"
      >
        常见问题
      </Link>
      <Link
        href="/login?state=login"
        className="text-sm font-medium hover:underline underline-offset-4"
      >
        登录
      </Link>
      <Link href="/login?state=sign-up" className="text-sm font-medium">
        <Button>注册</Button>
      </Link>
    </>
  );
};

export const Navigation = () => {
  return (
    <div className="w-full bg-background/60 backdrop-blur-md fixed top-0 left-0 px-8 py-4 z-50 shadow-md overflow-hidden">
      <header className="container mx-auto flex items-center">
        <Logo />

        {/* PC */}
        <nav className="hidden md:flex ml-auto items-center gap-4">
          <NavItems />
        </nav>

        {/* mobile */}
        <div className="md:hidden ml-auto">
          <Sheet>
            <SheetTrigger className="flex items-center justify-center">
              <Menu className="size-4" strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>导航</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
};
