#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting environment setup..."

# Step 1: Change to the my-app directory
cd my-app

# Step 2: Install required npm packages (including multer)
echo "Installing required npm packages..."
npm install multer
echo "Required npm packages installed."

# Step 3: Create or overwrite the .env.local file
echo "Setting up environment variables..."
cat <<EOL > .env.local
# JWT secret key
JWT_SECRET=63E8AE121217B47A2E75BBD38CFBF
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOL
echo ".env.local file created with environment variables."

# Step 4: Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy
echo "Database migrations completed."

# Step 5: Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
echo "Prisma client generated."

# Step 6: Check for required compilers/interpreters
check_command() {
    command -v "$1" >/dev/null 2>&1 || { 
        if [[ "$1" == "javac" ]]; then
            echo "$1 not found, installing default JDK..."
            sudo apt update
            sudo apt install default-jdk -y || { echo >&2 "Failed to install JDK. Please install it manually."; exit 1; }
            echo "JDK installed."
        else
            echo >&2 "$1 is required but not installed. Please install it."; exit 1
        fi
    }
}

echo "Checking for required compilers/interpreters..."
check_command "gcc"
check_command "g++"
check_command "python3"
check_command "java"
check_command "javac"
check_command "node"
echo "All required compilers/interpreters are installed."

# Step 7: Build Docker images
echo "Building Docker images..."
./build-images.sh

# Step 8: Return to the PP2 directory to run scripts
cd ..

echo "Environment setup completed successfully."
