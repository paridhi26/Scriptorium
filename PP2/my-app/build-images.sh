#!/bin/bash

# file to build all docker images while testing, will be added to startup script later

echo "Building Python..."
docker build -t python-executor -f Dockerfile.python .

echo "Building Node.js..."
docker build -t node-executor -f Dockerfile.node .

echo "Building Java..."
docker build -t java-executor -f Dockerfile.java .

echo "Building C..."
docker build -t c-executor -f Dockerfile.c .

echo "Building C++..."
docker build -t cpp-executor -f Dockerfile.cpp .

echo "Build completed!"
