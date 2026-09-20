"use client";

import { ImageRowType } from "@/app/actions/image-actions";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ImageOff } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ImageDialog } from "./image-dialog";

// 签名失败的行拿不到 url，渲染不出来也下载不了，直接排除
type DisplayImage = ImageRowType & { url: string };

export const GalleryImages = ({ images }: { images: ImageRowType[] }) => {
  const [selectedImage, setSelectedImage] = useState<ImageRowType | null>(null);

  const displayImages = images.filter(
    (image): image is DisplayImage => image.url !== null,
  );

  if (displayImages.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageOff />
            </EmptyMedia>
            <EmptyTitle>暂无图片</EmptyTitle>
            <EmptyDescription>快去生成你的第一张图片吧～</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Link href="/image-generation">
              <Button>前往生成图片</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <section className="container mx-auto py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayImages.map((image) => (
          <div
            key={image.id}
            className="relative group overflow-hidden cursor-pointer transition-transform"
            onClick={() => setSelectedImage(image)}
          >
            {/* 详情-遮罩层 */}
            <div className="absolute inset-0 opacity-0 duration-300 bg-black group-hover:opacity-80 flex justify-center items-center rounded">
              <p className="text-white/90 text-lg font-semibold">查看详情</p>
            </div>
            <Image
              src={image.url}
              alt={image.prompt ?? "生成的图片"}
              width={image.width ?? 1024}
              height={image.height ?? 1024}
              className="object-cover rounded"
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageDialog
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
};
