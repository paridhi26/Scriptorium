#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting the server..."

# Change to the my-app directory
cd my-app

# Start the server
npm run dev  # Use 'npm start' if running in production mode

# Note: The server will continue running; this script will keep running
