function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379"),
    password: parsed.password || undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
  };
}

export const redisConnection = parseRedisUrl(
  process.env.REDIS_URL || "redis://localhost:6379"
);

export default redisConnection;
