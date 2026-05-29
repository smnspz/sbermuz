# Stage 1: Install dependencies
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.0.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Stage 2: Build at runtime (needs Docker network to reach Directus), then serve
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.0.1 --activate
RUN apk add --no-cache caddy

WORKDIR /app
COPY --from=deps /app /app
COPY Caddyfile /etc/caddy/Caddyfile

ENV DIRECTUS_URL=http://directus:8055
ENV PUBLIC_DIRECTUS_URL=https://directus.sbermuz.club

CMD ["sh", "-c", "pnpm run build && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]

EXPOSE 69
