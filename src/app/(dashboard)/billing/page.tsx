import { getCredits } from "@/app/actions/credit-actions";
import { PlanSummary } from "@/components/billing/plan-summary";
import { Pricing } from "@/components/billing/pricing";
import { getProducts, getSubscription, getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  const supabase = createClient(await cookies());
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase),
  ]);

  if (!user) {
    redirect("/login");
  }

  const credits = await getCredits();

  return (
    <section className="container mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">账单</h1>
      <p className="text-sm text-muted-foreground mt-2">
        管理你的订阅和账单信息
      </p>
      <div className="grid gap-4 mt-8">
        <PlanSummary
          user={user}
          subscription={subscription}
          products={products || []}
          credits={credits.data}
        />
        {subscription?.status === "active" && (
          <Pricing
            user={user}
            products={products || []}
            subscription={subscription}
            showInterval={false}
            activeProduct={
              subscription?.prices?.products?.name.toLowerCase() || "Pro"
            }
          />
        )}
      </div>
    </section>
  );
};

export default Page;
