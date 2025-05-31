# 1️⃣ Use official Node.js image
FROM node:23-slim

# 2️⃣ Install OpenSSL (if using Prisma or require secure connections)
RUN apt-get update && apt-get install -y openssl

# 3️⃣ Enable Corepack (for pnpm)
RUN corepack enable

# 4️⃣ Set working directory
WORKDIR /app

# 5️⃣ Copy shared protos folder
COPY protos ./protos

# 6️⃣ Copy service source code
COPY notification-service/. ./notification-service/

# 7️⃣ Set working directory inside the service
WORKDIR /app/notification-service

# 8️⃣ Install dependencies
RUN pnpm install --frozen-lockfile

# 9️⃣ Generate Prisma client (optional, if using Prisma)
# RUN pnpm prisma generate

# 🔟 Expose port
EXPOSE 7002

# 🔁 Start service
CMD ["pnpm", "dev"]
