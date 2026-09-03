export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  resendApiKey: process.env.RESEND_API_KEY || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeConnectWebhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET || "",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

if (env.isProd) {
  const requiredKeys: (keyof typeof env)[] = [
    "stripeSecretKey",
    "stripeWebhookSecret",
    "stripeConnectWebhookSecret",
  ];
  for (const key of requiredKeys) {
    if (!env[key]) {
      console.warn(`⚠️ [PROD] Variable d'environnement manquante : ${key}`);
    }
  }
}

export default env;
