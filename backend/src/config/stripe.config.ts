// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require("stripe");
import env from "./env.config";

let _stripe: InstanceType<typeof Stripe> | null = null;

export function getStripe(): InstanceType<typeof Stripe> {
  if (!_stripe) {
    if (!env.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(env.stripeSecretKey, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}
