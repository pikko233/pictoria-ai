import { Database, Tables } from "@database.types";

export type Product = Tables<"products">;
export type Price = Tables<"prices">;
export type Subscription = Tables<"subscriptions">;
export type Credit = Tables<"credits">;
export type Model = Tables<"models">;

export interface ProductWithPrices extends Product {
  prices: Price[];
}

// 嵌套字段名来自 Supabase 关系名（被引用的表名），因此是复数 products。
// 对应查询：subscriptions.select("*, prices(*, products(*))")
export interface PriceWithProduct extends Price {
  products: Product | null;
}

export interface SubscriptionWithProducts extends Subscription {
  prices: PriceWithProduct | null;
}

export type TrainingStatus = Database["public"]["Enums"]["training_status"];
