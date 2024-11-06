#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting the server..."
npm run dev  # or npm start for production
echo "Server started."
