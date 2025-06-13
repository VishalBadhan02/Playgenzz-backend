# 1️⃣ Use official Node.js base image
FROM node:23-slim


# 2️⃣ Install OpenSSL (required for Prisma or secure operations)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install -g pnpm


# 3️⃣ Enable Corepack (to get pnpm)
RUN corepack enable

# 4️⃣ Set root working directory
WORKDIR /app

# 5️⃣ Copy shared protos into the image
COPY protos/ ./protos

# 6️⃣ Switch into your service folder
WORKDIR /app/team-service

# 7️⃣ Copy only the package files first (for layer caching)
COPY team-service/package.json team-service/pnpm-lock.yaml ./

# 8️⃣ Install your dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ Copy the rest of your service code
# COPY team-service/. ./

# 🔟 (Optional) Generate Prisma client if you’re using Prisma
# RUN pnpm prisma generate

# 1️⃣1️⃣ Expose the service port
EXPOSE 7005

# 🚀 Default start command
CMD ["pnpm", "dev"]
