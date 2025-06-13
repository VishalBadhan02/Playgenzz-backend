# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (for Prisma if used)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install -g pnpm

# 3️⃣ Enable Corepack (to use pnpm)
RUN corepack enable

# 4️⃣ Set working directory
WORKDIR /app

# Optional, conditional build logic
ARG INCLUDE_PROTOS=true

# 5️⃣ Copy shared protos
COPY protos/ ./protos

# 6️⃣ Set working directory for venue-service
WORKDIR /app/venue-service

# 7️⃣ Copy package manager files first for caching
COPY venue-service/package.json venue-service/pnpm-lock.yaml ./

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ Copy the rest of the source code
# COPY venue-service/ ./

# 🔟 (Optional) Generate Prisma client if used
# RUN pnpm prisma generate

# 1️⃣1️⃣ Expose the service port
EXPOSE 7008

# 🚀 Start the service
CMD ["pnpm", "dev"]
