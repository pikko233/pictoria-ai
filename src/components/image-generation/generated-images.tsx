"use client";

import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../ui/carousel";
import useGeneratedImageStore from "@/stores/generated-image";
import { Loader2 } from "lucide-react";

// const images = [
//   {
//     src: "/hero-images/Charismatic Young Man with a Warm Smile and Stylish Tousled Hair.jpeg",
//     alt: "something",
//   },
//   {
//     src: "/hero-images/Confident Businesswoman on Turquoise Backdrop.jpeg",
//     alt: "something",
//   },
//   {
//     src: "/hero-images/Confident Woman in Red Outfit.jpeg",
//     alt: "something",
//   },
//   {
//     src: "/hero-images/Confident Woman in Urban Setting.jpeg",
//     alt: "something",
//   },
// ];

export const GeneratedImages = () => {
  const images = useGeneratedImageStore((state) => state.images);
  const loading = useGeneratedImageStore((state) => state.loading);

  if (images.length === 0) {
    return (
      <Card className="w-full max-w-2xl bg-muted">
        <CardContent className="aspect-square flex items-center justify-center p-6">
          <span className="text-xl text-muted-foreground flex items-center">
            {loading ? (
              <>
                <Loader2 className="mr-2 size-6 animate-spin" />
                图片生成中
              </>
            ) : (
              "暂未生成图片"
            )}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Carousel className="w-full max-w-2xl h-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative rounded-lg flex justify-center items-center overflow-hidden aspect-square">
              <Image
                src={image.url}
                alt="Generated image using AI"
                fill
                className="h-full w-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
