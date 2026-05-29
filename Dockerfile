# Stage 1: Install dependencies
FROM node:22-alpine AS deps

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

# Stage 2: Build at runtime, then serve static files
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@9.0.1 --activate
RUN apk add --no-cache caddy

WORKDIR /app
COPY --from=deps /app /app
COPY Caddyfile /etc/caddy/Caddyfile

ENV DIRECTUS_URL=http://directus:8055

# Build the site at startup (so Docker network is available), then serve
CMD ["sh", "-c", "pnpm run build && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]

EXPOSE 69
