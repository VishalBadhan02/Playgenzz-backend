# 1. Use the official Node.js image
FROM node:23-slim

# 2. Set working directory in container
WORKDIR /app

# 3. Enable Corepack (for using pnpm easily)
RUN corepack enable

# 4. Copy package.json and lock file (needed to install packages)
COPY package.json ./
COPY pnpm-lock.yaml ./

# 5. Install packages without allowing changes (safe install)
RUN pnpm install --frozen-lockfile

# 6. Copy the rest of your code
COPY . .

# 7. Run the app when container starts
CMD ["pnpm", "start"]

EXPOSE 5001
