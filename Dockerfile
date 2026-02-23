FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy server and client
COPY server ./server
COPY client ./client

# Install all dependencies
RUN npm run install-all

# Build client
RUN npm run build:client

# Build server
RUN npm run build:server

# Expose ports
EXPOSE 5000 3000

# Start both server and client
CMD ["npm", "start:server"]
