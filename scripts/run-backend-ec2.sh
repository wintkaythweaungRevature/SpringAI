#!/bin/bash
# Run on EC2. Ensure /root/backend.env exists with all required vars including OPENAI_API_KEY.
# Usage: ./run-backend-ec2.sh [docker-username]
# Example: ./run-backend-ec2.sh wintkaythweaugn
set -e
DOCKER_USER="${1:-wintkaythweaugn}"
docker pull ${DOCKER_USER}/spring-ai-backend:latest
docker stop spring-ai-backend 2>/dev/null || true
docker rm spring-ai-backend 2>/dev/null || true
if [ -f /root/backend.env ]; then
  docker run -d -p 8080:8080 --name spring-ai-backend --restart always -v /root/certs:/app/certs --env-file /root/backend.env ${DOCKER_USER}/spring-ai-backend:latest
else
  echo "Create /root/backend.env first. See backend/env.example"
  exit 1
fi
echo "Backend started. Test: curl -s 'http://localhost:8080/api/ai/ask-ai?prompt=hi'"
