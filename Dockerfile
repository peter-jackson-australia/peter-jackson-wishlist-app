FROM oven/bun:1
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* bun.lock ./

RUN bun ci --omit=dev && bun cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN bun remove @shopify/cli

COPY . .

RUN bun run build

CMD ["bun", "run", "docker-start"]
