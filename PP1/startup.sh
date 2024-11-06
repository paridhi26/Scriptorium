#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting environment setup..."

# Step 1: Change to the my-app directory
cd my-app

# Step 2: Install npm packages
echo "Installing npm packages..."
npm install
echo "npm packages installed."

# Step 3: Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy
echo "Database migrations completed."

# Step 4: Check for required compilers/interpreters
check_command() {
    command -v "$1" >/dev/null 2>&1 || { echo >&2 "$1 is required but not installed. Please install it."; exit 1; }
}

echo "Checking for required compilers/interpreters..."
check_command "gcc"
check_command "g++"
check_command "python3"
check_command "java"
check_command "node"
echo "All required compilers/interpreters are installed."

# Step 5: Return to the PP1 directory to run scripts
cd ..

# Step 6: Clear the database
echo "Clearing the database..."
node my-app/scripts/clearDatabase.js
echo "Database cleared."

# Step 7: Add programming languages
echo "Adding programming languages..."
node my-app/scripts/addLanguages.js
echo "Programming languages added."

# Step 8: Create an admin user
echo "Creating admin user..."
node my-app/scripts/createAdmin.js
echo "Admin user created."

echo "Environment setup completed successfully."
