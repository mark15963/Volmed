#!/bin/bash

# Script to start the VolMed application using Docker
set -e

echo "=== Starting VolMed Docker Deployment ==="

# Change to project directory
cd /var/www/volmed

echo "1. Stopping any existing Docker containers..."
sudo docker compose down 2>/dev/null || true
echo "✅ Step 1 complete"

echo "2. Starting PostgreSQL (host service)..."
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable to start on boot if not already
echo "   PostgreSQL status: $(sudo systemctl is-active postgresql)"
echo "✅ Step 2 complete"

echo "3. Building frontend..."
cd client
sudo npm run build
cd ..
echo "✅ Step 3 complete"

echo "4. Building Docker images..."
sudo docker compose build --no-cache
echo "✅ Step 4 complete"

sleep 5

echo "5. Starting Docker services..."
sudo docker compose up -d --remove-orphans
echo "✅ Step 5 complete"

sleep 5

echo "6. Waiting for services to be healthy..."
sleep 10
echo "✅ Step 6 complete"

echo "7. Checking service status..."
echo "   Backend: $(sudo docker compose ps backend --format '{{.Status}}')"
echo "   Nginx: $(sudo docker compose ps nginx --format '{{.Status}}')"
echo "   PostgreSQL (host): $(sudo systemctl is-active postgresql)"
echo "✅ Step 7 complete"

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
echo "✅ Step 8 complete"

echo ""
echo "============== Deployment Complete ==============="
echo "|                                                |"
echo "|  Frontend: https://192.168.0.107               |"
echo "|  Backend API: https://192.168.0.107/api        |"
echo "|  API Health: https://192.168.0.107/api/health  |"
echo "|                                                |"
echo "=================================================="
echo ""
echo "Press enter to return to menu..."
read

exit 0