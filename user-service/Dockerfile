# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (for Prisma if used)
RUN apt-get update && apt-get install -y openssl

# 3️⃣ Enable Corepack (to use pnpm)
RUN corepack enable

# 4️⃣ Set working directory
WORKDIR /app

# 5️⃣ Copy shared protos
COPY protos ./protos

# 6️⃣ Copy user-service source code
COPY user-service/. ./user-service/

# 7️⃣ Set working directory for user-service
WORKDIR /app/user-service

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ (Optional) Generate Prisma client if used
# RUN pnpm prisma generate

# 🔟 Expose the service port
EXPOSE 7007

# 🚀 Start the service
CMD ["pnpm", "start"]
