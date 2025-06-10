# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (required for Prisma or secure operations)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 3️⃣ Enable Corepack (to use pnpm)
RUN corepack enable

# 4️⃣ Set base working directory
WORKDIR /app

# Optional, conditional build logic
ARG INCLUDE_PROTOS=true

# 5️⃣ Copy shared protos directory
COPY protos ./protos

# 6️⃣ Set working directory to team-service service
WORKDIR /app/team-service

# 7️⃣ Copy only package manager files first to leverage cache
COPY team-service/package.json team-service/pnpm-lock.yaml ./

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ Copy the rest of the service source code
COPY team-service ./

# 🔟 (Optional) Generate Prisma Client
# RUN pnpm prisma generate

# 1️⃣1️⃣ Expose service port
EXPOSE 7005

# 🚀 Start the service
CMD ["pnpm", "dev"]
