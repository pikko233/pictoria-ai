import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? "",
  {
    // 不指定 apiVersion，使用 SDK pinned 的版本（stripe v22 为 2026-08-26.dahlia）。
    // https://stripe.com/docs/api/versioning
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: "Next.js Subscription Starter",
      version: "0.0.0",
      url: "https://github.com/vercel/nextjs-subscription-payments",
    },
  },
);
