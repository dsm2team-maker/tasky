// On passe juste les options de connexion, pas une instance ioredis
// BullMQ utilise sa propre version d'ioredis en interne

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

console.log("✅ Redis config chargée:", redisConnection);

export default redisConnection;
