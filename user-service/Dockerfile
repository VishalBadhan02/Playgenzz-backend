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

# 6️⃣ Set working directory for user-service
WORKDIR /app/user-service

# 7️⃣ Copy only package manager files first to leverage Docker cache
COPY user-service/package.json user-service/pnpm-lock.yaml ./

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ Copy the rest of the user-service source code
COPY user-service/src ./src
COPY user-service/.env ./env

# 🔟 (Optional) Generate Prisma client if used
# RUN pnpm prisma generate

# 1️⃣1️⃣ Expose the service port
EXPOSE 7007

# 🚀 Start the service
CMD ["pnpm", "dev"]
