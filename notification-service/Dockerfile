# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (if using Prisma or require secure connections)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install -g pnpm

# 3️⃣ Enable Corepack (for pnpm)
RUN corepack enable

# 4️⃣ Set root working directory
WORKDIR /app

# 5️⃣ Copy shared protos folder
COPY protos/ ./protos

# 6️⃣ Set working directory inside the service
WORKDIR /app/notification-service

# 7️⃣ Copy only package manager files first for caching
COPY notification-service/package.json notification-service/pnpm-lock.yaml ./

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ Copy rest of the service code after installing dependencies
COPY notification-service/src ./src
COPY notification-service/.env ./env

# 🔟 (Optional) Generate Prisma client if needed
# RUN pnpm prisma generate

# 1️⃣1️⃣ Expose port
EXPOSE 7002

# 1️⃣2️⃣ Start service
CMD ["pnpm", "dev"]
