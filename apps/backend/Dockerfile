FROM node:18-alpine AS builder

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/domain/package*.json ./packages/domain/

# Install dependencies
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY . .

# Prisma database location (required by schema.prisma)
ENV DATABASE_URL=file:/app/data/dev.db

# Generate Prisma client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build the application
RUN npm run -w @fun-budget/domain build && npm run -w backend build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Prisma database location (required by schema.prisma)
ENV DATABASE_URL=file:/app/data/dev.db

# Copy built application
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/domain ./packages/domain
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/backend/prisma ./prisma

# Create data directory
RUN mkdir -p /app/data

# Define volume for persistent data
VOLUME ["/app/data"]

# Expose port
EXPOSE 3000

# Start the application
CMD ["/bin/sh", "-c", "export DATABASE_URL=file:/app/data/dev.db && npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main"]
