#!/bin/bash
# Run this on EC2 (as root) to pull the latest backend image and restart.
# Usage: DOCKER_USER=your_docker_hub_user ./redeploy-backend.sh
# Or set DOCKER_USER in the environment.
set -e
if [ -z "$DOCKER_USER" ]; then
  echo "Set DOCKER_USER (your Docker Hub username). Example: DOCKER_USER=myuser ./redeploy-backend.sh"
  exit 1
fi
docker pull ${DOCKER_USER}/spring-ai-backend:latest
docker stop spring-ai-backend 2>/dev/null || true
docker rm spring-ai-backend 2>/dev/null || true
if [ -f /root/backend.env ]; then
  docker run -d -p 8080:8080 --name spring-ai-backend --restart always \
    -v /root/certs:/app/certs --env-file /root/backend.env \
    ${DOCKER_USER}/spring-ai-backend:latest
else
  docker run -d -p 8080:8080 --name spring-ai-backend --restart always \
    ${DOCKER_USER}/spring-ai-backend:latest
fi
echo "Backend restarted. Test: curl -s 'http://localhost:8080/api/ai/ask-ai?prompt=hi'"
