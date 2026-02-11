#!/bin/bash

# Script to start the VolMed application using Docker
set -e

echo "=== Starting VolMed Docker Deployment ==="

# Change to project directory
cd /var/www/volmed

echo "1. Stopping any existing Docker containers..."
sudo docker compose down 2>/dev/null || true

echo "2. Starting PostgreSQL (host service)..."
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable to start on boot if not already
echo "   PostgreSQL status: $(sudo systemctl is-active postgresql)"

echo "3. Building frontend..."
cd client
sudo npm run build
cd ..

echo "4. Building Docker images..."
sudo docker compose build --no-cache

echo "5. Starting Docker services..."
sudo docker compose up -d --remove-orphans

echo "6. Waiting for services to be healthy..."
sleep 10

echo "7. Checking service status..."
echo "   Backend: $(sudo docker compose ps backend --format '{{.Status}}')"
echo "   Nginx: $(sudo docker compose ps nginx --format '{{.Status}}')"
echo "   PostgreSQL (host): $(sudo systemctl is-active postgresql)"

echo "8. Testing application..."
if curl -k -s --max-time 5 https://192.168.0.107/api/health > /dev/null; then
    echo "   ✓ Backend API is responding"
else
    echo "   ✗ Backend API is not responding"
fi

if curl -k -s --max-time 5 https://192.168.0.107/ > /dev/null; then
    echo "   ✓ Frontend is serving"
else
    echo "   ✗ Frontend is not serving"
fi

echo ""
echo "============== Deployment Complete ==============="
echo "|                                                |"
echo "|  Frontend: https://192.168.0.107               |"
echo "|  Backend API: https://192.168.0.107/api        |"
echo "|  API Health: https://192.168.0.107/api/health  |"
echo "|                                                |"
echo "=================================================="
echo ""
sleep 1
echo "Returning to control panel in 5 seconds..."
sleep 5

exec ~/volmed-scripts/volmed-control.sh
