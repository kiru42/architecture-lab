# syntax=docker/dockerfile:1
#
# Generic Dockerfile for **every** TaskFlow backend implementation.
# Select the implementation with the BACKEND_DIR build arg, e.g.:
#
#   docker build -f docker/backend.Dockerfile \
#     --build-arg BACKEND_DIR=05-ddd -t taskflow-backend-ddd .
#
# The build context MUST be the repository root, because each backend ships its
# Prisma schema + migrations inside its own prisma/ directory.

ARG BACKEND_DIR=01-layered-ntier

# ---------------------------------------------------------------- build stage
FROM node:20-alpine AS builder

# Prisma's query engine links against OpenSSL
RUN apk add --no-cache openssl

ARG BACKEND_DIR
WORKDIR /build

# 1. Dependencies first — this layer is cached unless the lockfile changes
COPY backend/${BACKEND_DIR}/package.json backend/${BACKEND_DIR}/package-lock.json ./
RUN npm ci

# 2. Prisma schema + migrations, then generate the client
COPY backend/${BACKEND_DIR}/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# 3. Sources, then compile
COPY backend/${BACKEND_DIR}/ ./
RUN npm run build

# -------------------------------------------------------------- runtime stage
FROM node:20-alpine AS runtime

RUN apk add --no-cache openssl

ENV NODE_ENV=production \
    PORT=3000

ARG BACKEND_DIR
WORKDIR /app

# Reuse the builder's node_modules so the generated Prisma client is preserved
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma

COPY docker/backend-entrypoint.sh /usr/local/bin/backend-entrypoint.sh
RUN chmod +x /usr/local/bin/backend-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/backend-entrypoint.sh"]
CMD ["node", "dist/main"]
