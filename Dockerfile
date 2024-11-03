# Use the official Node.js image as a base
FROM node:18

# Set working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

RUN pnpm add -D sass-embedded

# Copy package.json and pnpm-lock.yaml for installing dependencies
COPY package.json ./

# Install dependencies with pnpm
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN pnpm run build

# Expose the internal port (3000 is the default for Nuxt 3)
EXPOSE 3000

# Start the Nuxt 3 app
CMD ["node", ".output/server/index.mjs"]
