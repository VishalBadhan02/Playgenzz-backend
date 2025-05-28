# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl

# 4️⃣ Enable corepack first (needed for pnpm)
RUN corepack enable

# 5️⃣ Copy package files
COPY package.json pnpm-lock.yaml ./

# 6️⃣ Install dependencies
RUN pnpm install --frozen-lockfile

# 7️⃣ Copy prisma schema
COPY prisma ./prisma/

# 8️⃣ Generate Prisma Client
RUN pnpm prisma generate

# 9️⃣ Copy remaining source code
COPY . .

# 🔟 Expose port
EXPOSE 5002

# Start with migrations
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]