# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (needed for Prisma or other secure tools)
RUN apt-get update && apt-get install -y openssl

# 3️⃣ Enable Corepack (to use pnpm)
RUN corepack enable

# 4️⃣ Set working directory
WORKDIR /app

# 5️⃣ Copy shared protos
COPY protos ./protos

# 6️⃣ Copy tournament service code
COPY tournament-service/. ./tournament-service/

# 7️⃣ Set working directory for this service
WORKDIR /app/tournament-service

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ (Optional) Generate Prisma client if needed
# RUN pnpm prisma generate

# 🔟 Expose the service port
EXPOSE 7006

# 🚀 Start the service
CMD ["pnpm", "start"]
