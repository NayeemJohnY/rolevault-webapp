# Simplified Single-Container Dockerfile for RoleVault with MongoDB and Playwright

FROM mcr.microsoft.com/playwright:v1.56.0-noble

# Install MongoDB, curl, and other dependencies
RUN apt-get update && apt-get install -y \
    mongodb \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start-app.sh ./
COPY entrypoint.sh ./

# Build frontend
RUN cd frontend && npm run build

# Create necessary directories
RUN mkdir -p ./backend/uploads ./logs /data/db

# Make scripts executable
RUN chmod +x ./start-app.sh ./entrypoint.sh

# Set default environment variables (will be overridden by container.env in GitHub Actions)
ENV TESTENV=prod
ENV MONGODB_URI=mongodb://localhost:27017/${TESTENV}rolevault-db
ENV JWT_SECRET=default-secret-change-in-production
ENV JWT_EXPIRE=7d
ENV MAX_FILE_SIZE=10485760


# Expose ports
EXPOSE 5000 5001 27017

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# Use entrypoint to start services
ENTRYPOINT ["./entrypoint.sh"]