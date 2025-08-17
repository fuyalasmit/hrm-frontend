FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start"]
