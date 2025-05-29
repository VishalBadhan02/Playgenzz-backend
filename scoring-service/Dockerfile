# 1️⃣ Use official Node.js image
FROM node:18-slim

# 2️⃣ Install OpenSSL if needed (e.g., Prisma or secure connections)
RUN apt-get update && apt-get install -y openssl

# 3️⃣ Enable Corepack for pnpm
RUN corepack enable

# 4️⃣ Set working directory
WORKDIR /app

# 5️⃣ Copy shared protos folder
COPY protos ./protos

# 6️⃣ Copy scoring service source code
COPY scoring/. ./scoring/

# 7️⃣ Move into scoring directory
WORKDIR /app/scoring

# 8️⃣ Install dependencies
RUN pnpm install --frozen-lockfile

# 9️⃣ (Optional) Generate Prisma Client if using Prisma
# RUN pnpm prisma generate

# 🔟 Expose port
EXPOSE 5004

# 🔁 Start the service
CMD ["pnpm", "start"]
