# Stage 1: Build the Astro site
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.1 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the site
ARG DIRECTUS_URL=http://127.0.0.1:8055
ENV DIRECTUS_URL=$DIRECTUS_URL
RUN pnpm run build

# Stage 2: Serve static files
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 69
