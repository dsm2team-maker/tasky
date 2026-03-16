export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  resendApiKey: process.env.RESEND_API_KEY || "",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

export default env;
