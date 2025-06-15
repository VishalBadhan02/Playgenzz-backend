# 1️⃣ Use official Node.js image
FROM node:18-slim

# 2️⃣ Install OpenSSL if needed (e.g., Prisma or secure connections)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 3️⃣ Enable Corepack for pnpm
RUN corepack enable

# 4️⃣ Set root working directory
WORKDIR /app

# Optional, conditional build logic
ARG INCLUDE_PROTOS=true

# 5️⃣ Copy shared protos folder
COPY protos/ ./protos

# 6️⃣ Set working directory inside the scoring service
WORKDIR /app/scoring-service

# 7️⃣ Copy only package manager files first for caching
COPY scoring-service/package.json scoring-service/pnpm-lock.yaml ./

# 8️⃣ Install dependencies
RUN pnpm install --no-frozen-lockfile

# 9️⃣ Copy rest of the service source code
COPY scoring-service/src ./src
COPY scoring-service/.env ./env

# 🔟 (Optional) Generate Prisma Client if using Prisma
# RUN pnpm prisma generate

# 1️⃣1️⃣ Expose port
EXPOSE 7003

# 1️⃣2️⃣ Start the service
CMD ["pnpm", "dev"]
