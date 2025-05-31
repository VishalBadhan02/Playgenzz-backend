# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (required for Prisma or secure operations)
RUN apt-get update && apt-get install -y openssl

# 3️⃣ Enable Corepack (to use pnpm)
RUN corepack enable

# 4️⃣ Set base working directory
WORKDIR /app

# 5️⃣ Copy shared protos directory
COPY protos ./protos

# 6️⃣ Copy the team-service service source code
COPY team-service/. ./team-service/

# 7️⃣ Set working directory to team-service service
WORKDIR /app/team-service

# 8️⃣ Install dependencies
RUN pnpm install --frozen-lockfile

# 9️⃣ (Optional) Generate Prisma Client
# RUN pnpm prisma generate

# 🔟 Expose service port
EXPOSE 7005

# 🚀 Start the service
CMD ["pnpm", "start"]
