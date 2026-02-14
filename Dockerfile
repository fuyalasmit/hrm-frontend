FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files FIRST
COPY package.json pnpm-lock.yaml ./

# Install dependencies (this layer will be cached)
RUN pnpm install --frozen-lockfile

# Copy application code AFTER
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start"]