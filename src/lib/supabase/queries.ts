import { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  // 同一用户可能有多条生效中的订阅（例如换套餐时又开了一条），这里取最新的那条。
  // 不能只靠 maybeSingle：它在匹配到 2 行及以上时会返回 PGRST116 错误，
  // 若再把 error 丢掉，页面就会把「有订阅」误判成「未订阅」。
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .in("status", ["trialing", "active"])
    .order("created", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Subscription lookup failed:", error);
    return null;
  }

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { referencedTable: "prices" });

  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from("users")
    .select("*")
    .single();
  return userDetails;
});
