# Dockerfile for RoleVault App

FROM node:22-slim

# Install curl, netcat and other basic dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean


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

# Build frontend
RUN cd frontend && npm run build

# Create necessary directories
RUN mkdir -p ./backend/uploads ./logs

# Make scripts executable
RUN chmod +x ./start-app.sh

# Set default environment variables
ENV TESTENV=prod
ENV JWT_EXPIRE=7d
ENV MAX_FILE_SIZE=10485760

# Expose application ports only
EXPOSE 5000 5001

# Health check - dynamically use the correct port based on TESTENV
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD if [ "${TESTENV:-prod}" = "staging" ]; then curl -f http://localhost:5001/api/health; else curl -f http://localhost:5000/api/health; fi || exit 1

# Use entrypoint to start application services
ENTRYPOINT ["./start-app.sh", "--seed"]