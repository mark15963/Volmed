#!/bin/bash

# Script to deploy updates
set -e

echo "=== Deploying VolMed Updates ==="

cd /var/www/volmed

echo "1. Pulling latest code..."
git pull

echo "2. Updating frontend dependencies..."
cd client
npm ci
cd ..

echo "3. Updating backend dependencies..."
cd server
npm ci
cd ..

echo "4. Restarting services..."
./restart-docker.sh
