import { ProductWithPrices, SubscriptionWithProducts } from "@/lib/types";
import { User } from "@supabase/supabase-js";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Pricing } from "./pricing";

interface Props {
  user: User;
  subscription: SubscriptionWithProducts | null;
  products: ProductWithPrices[] | null;
}

export const PricingSheet = ({ user, subscription, products }: Props) => {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        升级套餐
      </SheetTrigger>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-[min(1120px,92vw)]">
        <SheetHeader>
          <SheetTitle>管理订阅套餐</SheetTitle>
          <SheetDescription>选择适合你需求和预算的套餐</SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Pricing
            products={products || []}
            user={user}
            subscription={subscription}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
