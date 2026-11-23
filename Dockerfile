# Dockerfile for interopmed-website (Next.js App)

# 1. Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and lock file
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN yarn build

# 2. Production Stage
FROM node:18-alpine
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["yarn", "start"]
