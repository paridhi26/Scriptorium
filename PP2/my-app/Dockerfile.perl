# Dockerfile.perl
FROM alpine:latest
RUN apk add --no-cache perl
WORKDIR /app
CMD ["perl", "code.pl"]
