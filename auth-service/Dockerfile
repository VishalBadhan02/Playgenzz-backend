# Use official Node.js image
FROM node:23-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl

# Enable corepack (for pnpm)
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy common protos
COPY protos ./protos

# Copy service code
COPY auth-service ./auth-service

# Move to auth-service directory
WORKDIR /app/auth-service

# Install dependencies inside auth-service
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma generate

# Expose port
EXPOSE 7001

# Run migrations and start server
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm dev"]
