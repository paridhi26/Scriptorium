#!/bin/bash

# file to build all docker images while testing, will be added to startup script later

echo "Building Python..."
docker build -t sandbox-python -f docker/Dockerfile-python .

echo "Building Node.js..."
docker build -t sandbox-node -f docker/Dockerfile-node .

echo "Building Java..."
docker build -t sandbox-java -f docker/Dockerfile-java .

echo "Building C..."
docker build -t sandbox-c -f docker/Dockerfile-c .

echo "Building C++..."
docker build -t sandbox-cpp -f docker/Dockerfile-cpp .

echo "Build completed!"
