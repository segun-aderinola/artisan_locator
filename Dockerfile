# Use official Node.js image as base
FROM node:20

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build TypeScript code (if using TypeScript)
RUN npm run build

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["node", "dist/server.js"]
