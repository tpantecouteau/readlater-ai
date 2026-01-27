#!/bin/bash
set -e

cd ~/readlater-ai

echo "Pulling latest changes..."
git pull

echo "Building API..."
docker build -t readlater_api ./api

echo "Building Frontend..."
docker build -f frontend/Dockerfile.prod -t readlater_frontend ./frontend

echo "Restarting containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "Done! Containers running:"
docker ps
