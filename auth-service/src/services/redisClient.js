import Redis from "ioredis";
import Config from "../config";

const redis = new Redis({
    host: Config.REDIS_HOST,
    port: Config.REDIS_PORT,
    //   password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
    console.log("✅ Redis connected");
});

redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
});

export default redis;
