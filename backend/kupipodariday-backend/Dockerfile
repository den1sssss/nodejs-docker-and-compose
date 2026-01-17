# Build stage
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:16-alpine AS production

WORKDIR /app

# Install pm2 globally
RUN npm install -g pm2

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage (only dist, not src)
COPY --from=builder /app/dist ./dist

# Copy ecosystem file for pm2
COPY ecosystem.config.js ./

# Expose port
EXPOSE 3000

# Start the application with pm2
CMD ["pm2-runtime", "ecosystem.config.js"]
