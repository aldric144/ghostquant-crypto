FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
RUN npm install

FROM base AS builder
WORKDIR /app

# Accept build args
ARG NEXT_PUBLIC_API_BASE=https://ghostquant-mewzi.ondigitalocean.app
ARG NEXT_PUBLIC_ALPHABRAIN_API=http://localhost:8081
ARG NEXT_PUBLIC_ECOSCAN_API=http://localhost:8082

# Set as environment variables for the build
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV NEXT_PUBLIC_ALPHABRAIN_API=${NEXT_PUBLIC_ALPHABRAIN_API}
ENV NEXT_PUBLIC_ECOSCAN_API=${NEXT_PUBLIC_ECOSCAN_API}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
