# Stage 1: Build
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the project (copy src to dist)
RUN npm run build

# Stage 2: Production
FROM node:16-alpine

WORKDIR /app

# Install pm2 globally
RUN npm install -g pm2

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage (dist folder, not src)
COPY --from=builder /app/dist ./dist

# Copy ecosystem config
COPY --from=builder /app/ecosystem.config.js ./

# Expose port
EXPOSE 3000

# Use pm2-runtime to run the application
CMD ["pm2-runtime", "ecosystem.config.js"]
