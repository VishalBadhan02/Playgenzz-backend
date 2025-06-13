# Use official Node.js image
FROM node:23-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y curl

# Enable corepack (for pnpm)
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy service code
COPY api-gateway/ ./api-gateway

# Move to auth-service directory
WORKDIR /app/api-gateway

# Install dependencies inside auth-service
RUN pnpm install --no-frozen-lockfile

# Expose port
EXPOSE 7000

# Run migrations and start server
CMD ["sh", "-c", "pnpm start"]

