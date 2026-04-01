#!/bin/bash
# Run this script on your EC2 instance (as root) to deploy W!ntAi.
# Set DOCKER_USERNAME or replace wintkaythweaugn with your Docker Hub username.

set -e
DOCKER_USER=${DOCKER_USERNAME:-wintkaythweaugn}

echo "Pulling latest images..."
docker pull ${DOCKER_USER}/spring-ai-react:latest
docker pull ${DOCKER_USER}/spring-ai-backend:latest

echo "Stopping old containers..."
docker stop spring-ai-react 2>/dev/null || true
docker rm spring-ai-react 2>/dev/null || true
docker stop spring-ai-backend 2>/dev/null || true
docker rm spring-ai-backend 2>/dev/null || true

echo "Starting frontend..."
docker run -d -p 80:80 --name spring-ai-react --restart always ${DOCKER_USER}/spring-ai-react:latest

echo "Starting backend..."
if [ -f /root/backend.env ]; then
  docker run -d -p 8080:8080 --name spring-ai-backend --restart always -v /root/certs:/app/certs --env-file /root/backend.env ${DOCKER_USER}/spring-ai-backend:latest
else
  echo "WARNING: /root/backend.env not found. Starting without env file."
  docker run -d -p 8080:8080 --name spring-ai-backend --restart always ${DOCKER_USER}/spring-ai-backend:latest
fi

echo "Done. Check: docker ps"
