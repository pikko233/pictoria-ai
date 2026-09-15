"use client";

import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Tables } from "@database.types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INTERVAL_LABEL_MAP } from "@/constants";

type Product = Tables<"products">;
type Price = Tables<"prices">;

interface ProductWithPrice extends Product {
  prices: Price[];
}

interface Props {
  products: ProductWithPrice[];
  mostPopular?: string;
}

export const Pricing = ({ products, mostPopular = "Pro" }: Props) => {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month",
  );

  return (
    <section className="w-full bg-muted flex flex-col items-center justify-center">
      <div className="w-full container mx-auto py-32 flex flex-col items-center gap-8">
        <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
          <span
            className={cn(
              "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]",
            )}
            style={{
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "destination-out",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "subtract",
              WebkitClipPath: "padding-box",
            }}
          />
          <AnimatedGradientText className="text-sm font-medium tracking-wider">
            价格
          </AnimatedGradientText>
        </div>

        <h1 className="text-4xl font-bold tracking-wide">选择最适合你的方案</h1>
        <p className="text-base text-muted-foreground">
          选择价格实惠的方案，用最出色的功能吸引受众、培养客户忠诚度、驱动销售增长。
        </p>

        <div className="flex items-center gap-4">
          <Label htmlFor="pricing-switch" className="text-base font-semibold">
            月付
          </Label>
          <Switch
            id="pricing-switch"
            value={billingInterval}
            onCheckedChange={(checked) =>
              setBillingInterval(checked ? "year" : "month")
            }
          />
          <Label htmlFor="pricing-switch" className="text-base font-semibold">
            年付
          </Label>
        </div>

        {products.length > 0 && (
          <div className="grid grid-cols-3 mx-auto gap-8">
            {products.map((product) => {
              const price = product.prices.find(
                (price) => price.interval === billingInterval,
              );

              if (!price) return;

              const priceString = Intl.NumberFormat("zh-CN", {
                style: "currency",
                currency: price.currency ?? "usd",
                minimumFractionDigits: 0,
              }).format((price.unit_amount || 0) / 100);
              return (
                <div
                  key={product.id}
                  className={cn(
                    "bg-card border rounded-xl shadow-sm h-fit divide-border divide-y",
                    product.name?.toLowerCase() === mostPopular.toLowerCase() &&
                      "scale-105 border-primary drop-shadow-sm",
                  )}
                >
                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-semibold">{product.name}</h1>
                      {product.name?.toLowerCase() ===
                        mostPopular.toLowerCase() && (
                        <Badge className="border-border font-semibold">
                          最受欢迎
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <p>
                      <span className="text-2xl font-bold">{priceString}</span>
                      <span className="text-sm text-muted-foreground">
                        /{INTERVAL_LABEL_MAP[billingInterval]}
                      </span>
                    </p>
                    <Link href="/login?state=sign-up">
                      <Button
                        size="lg"
                        className="w-full"
                        variant={
                          product.name?.toLowerCase() ===
                          mostPopular.toLowerCase()
                            ? "default"
                            : "secondary"
                        }
                      >
                        订阅
                      </Button>
                    </Link>
                  </div>
                  {product.metadata && (
                    <div className="p-5">
                      <h3 className="text-sm font-medium mb-2">
                        套餐包含以下内容:
                      </h3>
                      <ul className="list-disc pl-5">
                        {Object.values(product.metadata).map(
                          (feature, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground"
                            >
                              {feature}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
