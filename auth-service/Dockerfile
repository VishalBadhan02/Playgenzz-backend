# Use official Node.js base image
FROM node:23-slim

# Install OpenSSL for Prisma (used in migration and client generation)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install -g pnpm

# Enable corepack to use pnpm
RUN corepack enable

# Set root working directory
WORKDIR /app

# Optional, conditional build logic
ARG INCLUDE_PROTOS=true

# Copy shared protos directory
COPY protos/ ./protos             
# COPY ../protos ./protos if i am not using context in root folder

# Create service working directory
WORKDIR /app/auth-service

# Copy only package manager files first to leverage Docker cache
COPY auth-service/package.json auth-service/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the service code after installing dependencies
# COPY auth-service/ ./

# Generate Prisma client
RUN pnpm prisma generate

# Expose the service port
EXPOSE 7001

# Run migrations and then start the server
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm dev"]
