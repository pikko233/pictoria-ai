"use client";

import {
  Credit,
  ProductWithPrices,
  SubscriptionWithProducts,
} from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { PricingSheet } from "./pricing-sheet";
import { INTERVAL_LABEL_MAP } from "@/constants";
import { format } from "date-fns";

interface Props {
  user: User;
  subscription: SubscriptionWithProducts | null;
  products: ProductWithPrices[] | null;
  credits: Credit | null;
}

export const PlanSummary = ({
  user,
  subscription,
  products,
  credits,
}: Props) => {
  if (
    !credits ||
    !subscription ||
    subscription.status !== "active" ||
    !subscription.prices
  ) {
    return (
      <Card className="max-w-3xl">
        <CardHeader className="px-5 py-4 flex flex-col gap-4">
          <h3 className="flex items-center flex-wrap gap-2 text-base font-semibold">
            <span>套餐概览</span>
            <Badge variant="secondary">暂无套餐</Badge>
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-4 w-full">
            <div className="col-span-5 flex flex-col pr-12">
              <div className="flex items-center justify-between text-sm font-normal pb-1">
                <span>剩余图片生成额度</span>
                <span className="font-semibold">剩余 0 次</span>
              </div>
              <div>
                <Progress value={0} className="w-full h-2" />
              </div>
            </div>
            <div className="col-span-5 flex flex-col pr-12">
              <div className="flex items-center justify-between text-sm font-normal pb-1">
                <span>剩余模型训练额度</span>
                <span className="font-semibold">剩余 0 次</span>
              </div>
              <div>
                <Progress value={0} className="w-full h-2" />
              </div>
            </div>
            <div className="col-span-full flex flex-col">
              请升级套餐以使用本应用
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-background border-border">
          <div className="flex ml-auto">
            <PricingSheet
              user={user}
              subscription={subscription}
              products={products || []}
            />
          </div>
        </CardFooter>
      </Card>
    );
  }

  // console.log(subscription, "===subscription");

  const {
    products: subscriptionProduct,
    unit_amount,
    currency,
    interval,
  } = subscription.prices;

  const priceString = Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currency!,
    minimumFractionDigits: 0,
  }).format((unit_amount || 0) / 100);

  const imageGenCount = credits.image_generation_count ?? 0;
  const maxImageGenCount = credits.max_image_generation_count ?? 0;
  const modelTrainCount = credits.model_training_count ?? 0;
  const maxModelTrainCount = credits.max_model_training_count ?? 0;

  return (
    <Card className="max-w-3xl px-5 pb-8">
      <CardHeader className="py-4 flex flex-col gap-4">
        <h3 className="flex items-center flex-wrap gap-2 text-base font-semibold">
          <span>套餐概览</span>
          <Badge variant="secondary">{subscriptionProduct?.name} 套餐</Badge>
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 md:grid-cols-8 gap-8 w-full">
          <div className="col-span-5 flex flex-col">
            <div className="flex items-center justify-between font-normal pb-1">
              <span className="font-semibold">
                {imageGenCount}/{maxImageGenCount}
              </span>
              <span className="text-xs text-muted-foreground">
                剩余图片生成额度
              </span>
            </div>
            <div>
              <Progress
                value={imageGenCount / maxImageGenCount}
                max={1}
                min={0}
                className="w-full h-2"
              />
            </div>
          </div>
          <div className="col-span-5 flex flex-col">
            <div className="flex items-center justify-between font-normal pb-1">
              <span className="font-semibold">
                {modelTrainCount}/{maxModelTrainCount}
              </span>
              <span className="text-xs text-muted-foreground">
                剩余模型训练额度
              </span>
            </div>
            <div>
              <Progress
                value={modelTrainCount / maxModelTrainCount}
                max={1}
                min={0}
                className="w-full h-2"
              />
            </div>
          </div>
          <div className="col-span-5 md:col-span-3 flex items-start justify-between gap-2">
            <div className="flex flex-col text-sm">
              <span className="font-normal">
                价格/{INTERVAL_LABEL_MAP[interval!]}
              </span>
              <span className="font-medium">{priceString}</span>
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-normal">积分</span>
              <span className="font-medium">{maxImageGenCount}</span>
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-normal">重置日期</span>
              <span className="font-medium">
                {format(
                  new Date(subscription.current_period_end),
                  "yyyy-MM-dd",
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
