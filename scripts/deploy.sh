#!/bin/bash
set -e

cd ~/readlater-ai

echo "Pulling latest changes..."
git fetch origin
git reset --hard origin/main

echo "Building API..."
docker build -t readlater_api ./api

echo "Building Frontend..."
# Charger les variables d'environnement pour le build
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Force rebuild without cache correctly
docker build \
  --no-cache \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -f frontend/Dockerfile.prod \
  -t readlater_frontend \
  ./frontend

echo "Restarting containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "Done! Containers running:"
docker ps
