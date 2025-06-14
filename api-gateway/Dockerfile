# Use official Node.js image
FROM node:23-slim



# Enable corepack (for pnpm)
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy service code
COPY api-gateway/ ./api-gateway

# Move to auth-service directory
WORKDIR /app/api-gateway
# Enable corepack (for pnpm)
RUN corepack enable

COPY api-gateway/package.json .

COPY api-gateway/pnpm-lock.yaml .

# Install dependencies inside auth-service
RUN pnpm install --no-frozen-lockfile
# Copy service code
COPY api-gateway/ .


# Expose port
EXPOSE 7000

# Run migrations and start server
CMD ["sh", "-c", "pnpm start"]

