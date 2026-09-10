"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  /** 标题，默认「加载失败」 */
  title?: string;
  /** 补充说明，默认给出通用的重试提示 */
  description?: string;
  /** 具体的错误信息，通常来自接口返回，展示在卡片正文里 */
  message?: string;
  /** 重试回调，不传则默认刷新当前路由（重新执行服务端数据获取） */
  onRetry?: () => void;
  /** 重试按钮文案，传 null 可隐藏按钮 */
  retryLabel?: string | null;
  className?: string;
}

export const ErrorCard = ({
  title = "加载失败",
  description = "数据加载出错了，请稍后重试。",
  message,
  onRetry,
  retryLabel = "重新加载",
  className,
}: Props) => {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    router.refresh();
  };

  return (
    <Card
      className={cn("w-full max-w-sm [--card-spacing:--spacing(6)]", className)}
    >
      <CardHeader className="justify-items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" />
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {message && (
        <CardContent>
          <p className="rounded-lg bg-muted px-3 py-2 text-center font-mono text-xs break-all text-muted-foreground">
            {message}
          </p>
        </CardContent>
      )}
      {retryLabel && (
        <CardFooter className="justify-center">
          <Button variant="outline" onClick={handleRetry} nativeButton>
            <RefreshCw />
            {retryLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
