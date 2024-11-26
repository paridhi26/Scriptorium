# Dockerfile.java
FROM openjdk:17-slim
WORKDIR /app
CMD ["sh", "-c", "javac code.java && java -cp /app Main"]
