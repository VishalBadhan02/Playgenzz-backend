# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (needed for Prisma or other secure tools)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install -g pnpm

# 3️⃣ Enable Corepack (to use pnpm)
RUN corepack enable

WORKDIR /app

# Optional, conditional build logic
ARG INCLUDE_PROTOS=true

# 5️⃣ Copy shared protos
COPY protos/ ./protos

WORKDIR /app/tournament-service


# 7️⃣ Copy only package manager files first to leverage Docker cache
COPY tournament-service/package.json .
COPY tournament-service/pnpm-lock.yaml .

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ Copy the rest of the service source code
COPY tournament-service/src ./src
COPY tournament-service/.env ./env

# 🔟 (Optional) Generate Prisma client if needed
# RUN pnpm prisma generate

# 1️⃣1️⃣ Expose the service port
EXPOSE 7006

# 🚀 Start the service
CMD ["pnpm", "dev"]
