# Dockerfile.go
FROM golang:latest
WORKDIR /app
CMD ["go", "run", "code.go"]