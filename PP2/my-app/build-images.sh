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

echo "Building Go..."
docker build -t go-executor -f Dockerfile.go .

echo "Building Ruby..."
docker build -t ruby-executor -f Dockerfile.ruby .

echo "Building Rust..."
docker build -t rust-executor -f Dockerfile.rust .

echo "Building Perl..."
docker build -t perl-executor -f Dockerfile.perl .

echo "Building PHP..."
docker build -t php-executor -f Dockerfile.php .

echo "Build completed!"
