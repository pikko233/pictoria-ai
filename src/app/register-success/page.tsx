"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";

const REDIRECT_DELAY_MS = 2_000;

export default function RegisterSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/login");
    }, REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">注册成功</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          邮箱已确认，2 秒后将自动前往登录页面。
        </p>
        <Link
          href="/login"
          className={buttonVariants({ className: "mt-6 w-full" })}
        >
          立即登录
        </Link>
      </div>
    </main>
  );
}
