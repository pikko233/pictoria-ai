"use client";

import { ImageRowType } from "@/app/actions/image-actions";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useState } from "react";
import { DeleteImage } from "./delete-image";

interface Props {
  image: ImageRowType;
  onClose: () => void;
}

export const ImageDialog = ({ image, onClose }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    setLoading(true);
    fetch(image.url || "")
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `generated-image-${Date.now()}.${image.output_format ?? "png"}`,
        );

        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        // 释放 blob URL，否则会一直占着内存直到页面刷新
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="max-w-sm md:max-w-full w-full">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">图片详情</SheetTitle>
          <ScrollArea className="flex flex-col h-screen">
            {/* 图片 */}
            <div className="group mt-3 relative w-fit h-fit">
              <Image
                src={image.url ?? ""}
                alt={image.prompt ?? "生成的图片"}
                width={image.width ?? 1024}
                height={image.height ?? 1024}
                className="object-cover rounded w-full h-auto"
              />
              {/* 图片底部按钮 */}
              <div className="flex md:hidden md:group-hover:flex absolute bottom-3 right-3 gap-2">
                <Button size="icon" onClick={handleDownload} disabled={loading}>
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {/* <span>下载</span> */}
                </Button>
                {/* 删除图片按钮 */}
                <DeleteImage
                  imageId={image.id.toString()}
                  onDelete={onClose}
                  imageName={image.image_name ?? ""}
                />
              </div>
            </div>
            {/* 分割线 */}
            <Separator className="my-3" />
            {/* 图片信息 */}
            <p className="text-primary/90 w-full flex flex-col">
              <span className="text-primary text-lg font-semibold">提示词</span>
              {image.prompt}
            </p>
            <Separator className="my-3" />
            {/* 图片标签 */}
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="secondary"
                className="rounded-full py-4 px-3 text-sm font-normal border border-primary/30"
              >
                <span className="text-primary font-semibold">模型名称: </span>
                {image.model}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full py-4 px-3 text-sm font-normal border border-primary/30"
              >
                <span className="text-primary font-semibold">图片比例: </span>
                {image.aspect_ratio}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full py-4 px-3 text-sm font-normal border border-primary/30"
              >
                <span className="text-primary font-semibold">图片宽高: </span>
                {image.width}x{image.height}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full py-4 px-3 text-sm font-normal border border-primary/30"
              >
                <span className="text-primary font-semibold">指导程度: </span>
                {image.guidance}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full py-4 px-3 text-sm font-normal border border-primary/30"
              >
                <span className="text-primary font-semibold">推理步数: </span>
                {image.num_inference_steps}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full py-4 px-3 text-sm font-normal border border-primary/30"
              >
                <span className="text-primary font-semibold">图片格式: </span>
                {image.output_format}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full py-4 px-3 text-sm font-normal border border-primary/30"
              >
                <span className="text-primary font-semibold">创建时间: </span>
                {new Date(image.created_at).toLocaleDateString()}
              </Badge>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
