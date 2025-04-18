FROM node:23-slim

WORKDIR /app
RUN corepack enable
COPY package.json ./  pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5000
CMD [ "node", "server.js" ]


