# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (typeorm CLI vive en deps, alcanza para migraciones)
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Run as non-root
USER node

# Expose port (override with --build-arg PORT=XXXX)
ARG PORT=3000
EXPOSE ${PORT}

# Start application
CMD ["node", "dist/index.js"]
