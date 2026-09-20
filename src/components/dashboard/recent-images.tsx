"use client";

import { ImageRowType } from "@/app/actions/image-actions";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface Props {
  images: Array<ImageRowType>;
  className?: string;
}

export const RecentImages = ({ images, className }: Props) => {
  if (images.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>最近生成</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <p className="my-16 text-muted-foreground">还没有生成过图片</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>最近生成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem
                key={index}
                className="basis-full sm:basis-1/2 xl:basis-1/3"
              >
                <div className="space-y-2">
                  {/* 比例来自数据，只能走 style：Tailwind 扫不到拼接出来的类名 */}
                  <div
                    className="relative overflow-hidden rounded-lg"
                    style={{
                      aspectRatio:
                        image.width && image.height
                          ? `${image.width} / ${image.height}`
                          : "1 / 1",
                    }}
                  >
                    <Image
                      src={image.url || ""}
                      alt={image.prompt || ""}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {image.prompt}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* 默认的 -left-12/-right-12 会落在 Card 外面，被 Card 的 overflow-hidden 裁掉 */}
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        <div className="flex justify-end">
          <Link href={`/gallery`}>
            <Button variant={"ghost"}>
              查看画廊
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
