#!/bin/bash
# Run spring-ai-backend on EC2.
# Create /root/backend.env with your secrets (OPENAI_API_KEY, DB_*, JWT_SECRET, etc.). See backend/env.example.
set -e
DOCKER_USER="${1:-wintkaythweaugn}"
docker pull ${DOCKER_USER}/spring-ai-backend:latest
docker stop spring-ai-backend 2>/dev/null || true
docker rm spring-ai-backend 2>/dev/null || true
if [ -f /root/backend.env ]; then
  docker run -d -p 8080:8080 --name spring-ai-backend --restart always \
    -v /root/certs:/app/certs --env-file /root/backend.env \
    ${DOCKER_USER}/spring-ai-backend:latest
  echo "Backend started. Test: curl -s 'http://localhost:8080/api/ai/ask-ai?prompt=hi'"
else
  echo "Create /root/backend.env first. Copy backend/env.example and fill in your values."
  exit 1
fi
