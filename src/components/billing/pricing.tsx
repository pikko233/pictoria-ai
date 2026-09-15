"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import {
  Price,
  ProductWithPrices,
  SubscriptionWithProducts,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { checkoutWithStripe, createStripePortal } from "@/lib/stripe/server";
import { getErrorRedirect } from "@/lib/helpers";
import { INTERVAL_LABEL_MAP } from "@/constants";
import { toast } from "../ui/toast";

interface Props {
  user: User | null;
  subscription: SubscriptionWithProducts | null;
  products: ProductWithPrices[];
  mostPopularProduct?: string;
  showInterval?: boolean;
  activeProduct?: string;
}

const renderPricingButton = ({
  loading,
  subscription,
  user,
  product,
  price,
  mostPopularProduct,
  handleCheckout,
  handlePortalRequest,
}: {
  loading: boolean;
  subscription: SubscriptionWithProducts | null;
  user: User | null;
  product: ProductWithPrices;
  price: Price;
  mostPopularProduct: string;
  handlePortalRequest: () => Promise<void>;
  handleCheckout: (price: Price) => Promise<void>;
}) => {
  const variant =
    product.name?.toLowerCase() === mostPopularProduct.toLowerCase()
      ? "default"
      : "secondary";
  const className = "mt-8 w-full font-semibold";

  // 未登录或尚未订阅：点击后由 handleCheckout 处理（未登录会跳登录页）
  if (!user || !subscription) {
    return (
      <Button
        variant={variant}
        onClick={() => handleCheckout(price)}
        className={className}
        disabled={loading}
      >
        订阅
      </Button>
    );
  }

  // 当前卡片就是用户已订阅的套餐
  if (
    subscription.prices?.products?.name?.toLowerCase() ===
    product.name?.toLowerCase()
  ) {
    return (
      <Button
        onClick={() => handlePortalRequest()}
        className={className}
        disabled={loading}
      >
        管理订阅
      </Button>
    );
  }

  // 已订阅其他套餐
  return (
    <Button
      variant={"secondary"}
      onClick={() => handlePortalRequest()}
      className={className}
      disabled={loading}
    >
      切换套餐
    </Button>
  );
};

export const Pricing = ({
  user,
  subscription,
  products,
  mostPopularProduct = "Pro",
  showInterval = true,
  activeProduct = "Pro",
}: Props) => {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month",
  );
  const router = useRouter();
  const currentPath = usePathname();
  const [loading, setLoading] = useState(false);

  const handleCheckoutAsync = async (price: Price) => {
    if (!user) {
      return router.push("/login");
    }

    try {
      const { errorRedirect, sessionUrl } = await checkoutWithStripe(
        price.id,
        currentPath,
      );

      if (errorRedirect || !sessionUrl) {
        return router.push(
          errorRedirect ??
            getErrorRedirect(currentPath, "未知错误", "请稍后再试"),
        );
      }

      // 整页跳转到 Stripe。这里刻意不复位 loading：
      // 跳转发起到页面真正离开之间还有一段时间，复位会让按钮闪回可点状态。
      window.location.assign(sessionUrl);
    } catch (error) {
      router.push(
        getErrorRedirect(
          currentPath,
          error instanceof Error ? error.message : "未知错误",
          "请稍后再试",
        ),
      );
    }
  };

  const handleCheckout = async (price: Price) => {
    setLoading(true);
    toast.promise(
      handleCheckoutAsync(price).finally(() => setLoading(false)),
      {
        loading: "加载中...",
        success: "加载成功",
        error: (error) => `加载失败: ${error}`,
      },
    );
  };

  const handlePortalRequest = async () => {
    setLoading(true);
    toast.promise(
      createStripePortal(currentPath)
        .then((redirectUrl) => router.push(redirectUrl))
        .finally(() => setLoading(false)),
      {
        loading: "加载中...",
        success: "加载成功",
        error: (error) => `加载失败: ${error}`,
      },
    );
  };

  return (
    <section className="max-w-7xl mx-auto w-full flex flex-col">
      <div className="w-full flex flex-col items-center gap-8 py-10">
        {showInterval && (
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
        )}

        {products.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    product.name?.toLowerCase() ===
                      mostPopularProduct.toLowerCase() &&
                      "scale-105 border-primary drop-shadow-sm",
                  )}
                >
                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-semibold">{product.name}</h1>
                      {product.name?.toLowerCase() ===
                      activeProduct.toLowerCase() ? (
                        <Badge className="border-border font-semibold">
                          当前套餐
                        </Badge>
                      ) : (
                        product.name?.toLowerCase() ===
                          mostPopularProduct.toLowerCase() && (
                          <Badge className="border-border font-semibold">
                            最受欢迎
                          </Badge>
                        )
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
                    {renderPricingButton({
                      loading,
                      subscription,
                      user,
                      product,
                      price,
                      mostPopularProduct,
                      handleCheckout,
                      handlePortalRequest,
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
