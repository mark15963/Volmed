#!/bin/bash

# Script to start the VolMed application using Docker
# set -e
clear

echo "=== Starting VolMed Docker Deployment ==="
echo ""
echo "============================================="
echo "1. Stopping any existing Docker containers..."
./stop-docker.sh
echo "============================================="
echo ""
echo "2. Starting PostgreSQL (host service)..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo "   PostgreSQL status: $(sudo systemctl is-active postgresql)"
echo ""
echo ""
echo "3. Building frontend..."
cd /var/www/volmed
cd client
sudo npm run build
cd ..
echo ""
echo ""
echo "4. Building Docker images..."
sudo docker compose build --no-cache
echo ""
echo ""
echo "5. Starting Docker services..."
sudo fuser -k 80/tcp
sudo docker compose up -d --remove-orphans
echo ""
echo ""
echo "6. Waiting for services to be healthy..."
sleep 10
echo ""
echo ""
echo "7. Checking service status..."
echo "   Backend: $(sudo docker compose ps backend --format '{{.Status}}')"
echo "   Nginx: $(sudo docker compose ps nginx --format '{{.Status}}')"
echo "   PostgreSQL (host): $(sudo systemctl is-active postgresql)"
echo ""
echo ""
echo "8. Testing application..."
if curl -k -s --max-time 5 https://192.168.0.107/api/health > /dev/null; then
    echo "   ✓ Backend API is responding"
else
    echo "   ✗ Backend API is not responding"
fi

if curl -k -s --max-time 5 https://192.168.0.107/ > /dev/null; then
    echo "   ✓ Frontend is serving"
    healthy=true
else
    echo "   ✗ Frontend is not serving"
    healthy=false
fi
if $healthy; then
    clear
    echo "============== Deployment Complete ==============="
    echo "|                                                |"
    echo "|  Frontend: https://192.168.0.107               |"
    echo "|  Backend API: https://192.168.0.107/api        |"
    echo "|  API Health: https://192.168.0.107/api/health  |"
    echo "|                                                |"
    echo "=================================================="
    echo ""
    read -p "Press enter to return to menu..."
else
    echo ""
    echo "⚠️  One or more checks failed!"
    echo "Please review the output above."
    echo ""
    read -p "Press Enter to return to menu..."
fi