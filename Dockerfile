# Use a Node.js base image for building
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production stage - Use nginx to serve static files
FROM nginx:alpine

# Install dumb-init to handle PID 1 properly
RUN apk add --no-cache dumb-init

# Copy the build output to nginx's default directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/nginx.conf

# Create a non-root user if it doesn't exist
# This handles the case where nginx group/user might already exist in the base image
RUN if ! getent group nginx >/dev/null; then addgroup -g 1001 -S nginx; fi && \
    if ! getent passwd nginx >/dev/null; then adduser -S nginx -u 1001 -G nginx; fi

# Change ownership of the html directory
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx/conf.d

# Expose the port
EXPOSE 80

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]