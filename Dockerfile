# Run Node/npm on the builder's native architecture, not under QEMU.
FROM --platform=$BUILDPLATFORM node:22-alpine AS deps
WORKDIR /app

COPY package-lock.json package.json ./
RUN npm ci --ignore-scripts

FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM --platform=$BUILDPLATFORM node:22-alpine AS prod-deps
WORKDIR /app

COPY package-lock.json package.json ./
RUN npm ci --ignore-scripts --omit=dev && \
    if find node_modules -type f \( -name '*.node' -o -name '*.so' \) -print | grep -q .; then \
      echo 'Native runtime addons require an architecture-specific build.' >&2; \
      exit 1; \
    fi

FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    apk --no-cache add dumb-init

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=prod-deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser

ENV PORT=3002
ENV NODE_ENV=production

EXPOSE 3002

ENTRYPOINT ["dumb-init", "--"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('node:net').connect(3002, '127.0.0.1').on('connect', function () { this.end(); process.exit(0); }).on('error', function () { process.exit(1); })"

CMD ["node", "dist/main.js"]
