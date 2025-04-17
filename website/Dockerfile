# website/Dockerfile

# Stage 1: Build the React application
FROM node:20-alpine as build-stage
# Set WORKDIR to where website code lives within the new mount structure
WORKDIR /workspaces/resume-maker-react/website

RUN apk add --no-cache git


# Copy package files relative to build context (./website) to WORKDIR
COPY package*.json ./

# Install dependencies in WORKDIR
RUN npm install

# Copy rest of website code relative to build context to WORKDIR
COPY . .

# Build the application in WORKDIR
RUN npm run build

# Stage 2: Serve the built application using a lightweight web server
FROM nginx:stable-alpine

# Copy the built files from the build stage's new WORKDIR
COPY --from=build-stage /workspaces/resume-maker-react/website/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]