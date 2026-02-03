# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy everything first to ensure context is correct
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (from the copied files)
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm build

# Final Stage (Runtime)
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy production dependencies and built files
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "dist/server.js"]
