# website/Dockerfile (for Development)

FROM node:23-slim as development

# Set the working directory
WORKDIR /app

# Install Git as it might be needed for npm install of certain packages
RUN apt-get update && apt-get install -y git --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies
# We install both dev and production dependencies here for development
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port next dev will listen on
EXPOSE 3000

# No CMD needed, docker-compose.yml will provide the run command
