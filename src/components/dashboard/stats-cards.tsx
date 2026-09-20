"use client";

import { Credit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ImageIcon, Layers, Wallet, ZapIcon } from "lucide-react";

interface Props {
  modelCount: number;
  imageCount: number;
  credits: Credit | null;
}

export const StatsCards = ({ modelCount, imageCount, credits }: Props) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">图片总数</CardTitle>
          <ImageIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{imageCount}</div>
          <div className="text-xs text-muted-foreground">累计生成的图片</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">已训练模型</CardTitle>
          <Layers className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{modelCount}</div>
          <div className="text-xs text-muted-foreground">
            已训练的自定义模型
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">图片额度</CardTitle>
          <ZapIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {credits?.image_generation_count || 0}/
            {credits?.max_image_generation_count || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            可用的图片生成额度
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">训练额度</CardTitle>
          <Wallet className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {credits?.model_training_count || 0}/
            {credits?.max_model_training_count || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            可用的模型训练额度
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
