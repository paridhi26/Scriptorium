# Dockerfile.cpp
FROM gcc:12.2.0
WORKDIR /app
CMD ["sh", "-c", "g++ code.cpp -o code && ./code"]
