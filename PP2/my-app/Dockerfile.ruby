# Dockerfile.ruby
FROM ruby:latest
WORKDIR /app
CMD ["ruby", "code.rb"]
