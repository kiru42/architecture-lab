FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared Prisma schema
COPY shared/prisma ./shared/prisma

# Copy backend package files
COPY backend/01-layered-ntier/package*.json ./backend/01-layered-ntier/
WORKDIR /app/backend/01-layered-ntier
RUN npm ci

# Copy backend source
COPY backend/01-layered-ntier ./

# Generate Prisma client and build
RUN npm run prisma:generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy shared Prisma schema
COPY shared/prisma ./shared/prisma

# Copy package files
COPY backend/01-layered-ntier/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/backend/01-layered-ntier/dist ./dist

# Generate Prisma client for production
RUN npx prisma generate --schema=../../shared/prisma/schema.prisma

EXPOSE 3000

CMD ["node", "dist/main"]
