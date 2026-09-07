"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const GalleryError = ({ message }: { message: string | null }) => {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center h-[50vh]">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>图片加载失败</EmptyTitle>
          <EmptyDescription>{message ?? "请稍后再试"}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          {/* refresh 会重新执行页面的 server component，重新拉一次图片 */}
          <Button onClick={() => router.refresh()}>重试</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
};
