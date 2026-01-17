# Build stage
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variable
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:latest

# Copy built application from builder stage (only build, not src)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# nginx starts automatically
