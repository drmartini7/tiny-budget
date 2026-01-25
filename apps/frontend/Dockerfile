FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/domain/package*.json ./packages/domain/

# Install dependencies
RUN npm ci --workspaces --include-workspace-root

# Copy source code
COPY . .

# Build the application
RUN npm run -w @fun-budget/domain build && npm run -w frontend build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
