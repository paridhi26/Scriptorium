# Dockerfile.c
FROM gcc:12.2.0
WORKDIR /app
CMD ["sh", "-c", "gcc code.c -o code && ./code"]
