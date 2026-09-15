import Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord,
} from "@/lib/supabase/admin";

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response("Webhook secret not found.", { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`❌ Error message: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case "price.deleted":
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case "product.deleted":
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created",
          );
          break;
        }
        case "checkout.session.completed": {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true,
            );
          }
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          const subscription =
            invoice.parent?.subscription_details?.subscription;

          // 只有周期续费才重置额度。首期账单的 billing_reason 是
          // subscription_create，它的额度已经由 subscription.created 发过，
          // 在这里再发一次会把用户当期已消耗的额度抹平
          if (invoice.billing_reason === "subscription_cycle" && subscription) {
            await manageSubscriptionStatusChange(
              typeof subscription === "string" ? subscription : subscription.id,
              invoice.customer as string,
              true,
            );
          }
          break;
        }
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.error(`❌ Handler failed for ${event.type}:`, error);
      return new Response(
        "Webhook handler failed. View your Next.js function logs.",
        {
          status: 500,
        },
      );
    }
  } else {
    // 不关心的事件也必须回 2xx：任何非 2xx 都会被 Stripe 判定为投递失败，
    // 进而按退避策略重试最长 3 天，并可能自动停用该 endpoint。
    console.log(`⏭️  Ignored event: ${event.type}`);
  }
  return new Response(JSON.stringify({ received: true }));
}
