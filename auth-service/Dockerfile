# 1️⃣ Use official Node.js image
FROM node:18

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package.json and pnpm-lock.yaml (ensures better caching)
COPY package.json pnpm-lock.yaml ./

# 4️⃣ Enable corepack and install dependencies with pnpm
RUN corepack enable && pnpm install --frozen-lockfile

# 5️⃣ Copy all source code
COPY . .

# 6️⃣ Expose service port (change if needed)
EXPOSE 4001

# 7️⃣ Start the service
CMD ["pnpm", "start"]
