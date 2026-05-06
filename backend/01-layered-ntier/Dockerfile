ARG BACKEND_DIR=01-layered-ntier

FROM node:20-alpine AS builder

WORKDIR /build

# Copy shared Prisma schema first
COPY ./shared/prisma ./shared/prisma

# Copy backend files
ARG BACKEND_DIR
COPY ./backend/${BACKEND_DIR}/package*.json ./backend/${BACKEND_DIR}/
WORKDIR /build/backend/${BACKEND_DIR}

RUN npm ci

COPY ./backend/${BACKEND_DIR}/ ./

# Generate Prisma client and build
RUN npm run prisma:generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy shared Prisma schema for runtime
COPY --from=builder /build/shared/prisma ./shared/prisma

# Install production dependencies
ARG BACKEND_DIR
COPY --from=builder /build/backend/${BACKEND_DIR}/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /build/backend/${BACKEND_DIR}/dist ./dist

# Copy entrypoint script
COPY ./backend/${BACKEND_DIR}/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Generate Prisma client for production
RUN npx prisma generate --schema=./shared/prisma/schema.prisma

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
