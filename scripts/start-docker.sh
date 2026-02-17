#!/bin/bash

# Script to start the VolMed application using Docker
# set -e

clear
echo ""
echo "=== Starting VolMed Docker Deployment ==="
echo ""

./stop-docker.sh

echo ""
echo "2. Starting PostgreSQL (host service)..."
sudo systemctl start postgresql
sudo systemctl enable postgresql >/dev/null 2>&1
echo "   PostgreSQL status: $(sudo systemctl is-active postgresql)"
echo ""

echo ""
echo "3. Detecting current network IP..."
HOST_IP=$("./get-host-ip.sh")

if [ -z "$HOST_IP" ]; then
    HOST_IP="localhost"
    echo "   Warning: Could not detect LAN IP -> falling back to localhost"
else
    echo "   Detected IP: $HOST_IP"
fi
echo ""

echo ""
echo "4. Building frontend..."
cd /var/www/volmed || { echo "Client folder not found!"; exit 1; }
cd client
sudo npm run build
cd ..
echo ""

echo ""
echo "5. Building Docker images..."
sudo docker compose build --no-cache
echo ""

echo ""
echo "6. Starting Docker services..."
sudo fuser -k 80/tcp 2>/dev/null || true
sudo docker compose up -d --remove-orphans
echo ""

echo ""
echo "7. Waiting for services to be healthy..."
sleep 10
echo ""

echo ""
echo "8. Checking service status..."
echo "   Backend: $(sudo docker compose ps backend --format '{{.Status}}')"
echo "   Nginx: $(sudo docker compose ps nginx --format '{{.Status}}')"
echo "   PostgreSQL (host): $(sudo systemctl is-active postgresql)"
echo ""

echo ""
echo "9. Testing application on detected IP ($HOST_IP)..."

HEALTH_OK=false
FRONT_OK=false

echo -n "   Backend API (/api/health) ... "

if curl -k -s --max-time 5 "https://$HOST_IP/api/health" > /dev/null; then
    echo "✓ responding (https)"
    HEALTH_OK=true
elif curl -s --max-time 5 "http://$HOST_IP/api/health" > /dev/null; then
    echo "✓ responding (http fallback)"
    HEALTH_OK=true
else
    echo "✗ not responding"
    echo "      tried: https://$HOST_IP/api/health"
    echo "         &  http://$HOST_IP/api/health"
fi

echo -n "   Frontend (/) ............ "

if curl -k -s --max-time 5 "https://$HOST_IP/" > /dev/null; then
    echo "✓ serving (https)"
    FRONT_OK=true
elif curl -s --max-time 5 "http://$HOST_IP/" > /dev/null; then
    echo "✓ serving (http fallback)"
    FRONT_OK=true
else
    echo "✗ not serving"
    echo "      tried: https://$HOST_IP/"
    echo "         &  http://$HOST_IP/"
fi

echo ""

if $HEALTH_OK && $FRONT_OK; then
    clear
    echo "============== Deployment Complete ==============="
    echo "|                                                |"
    printf "|  Frontend: https://%-15s               |\n" "$HOST_IP"
    printf "|  Backend API: https://%-15s/api        |\n" "$HOST_IP"
    printf "|  API Health: https://%-15s/api/health  |\n" "$HOST_IP"
    echo "|                                                |"
    echo "=================================================="
    echo ""
    echo "   Open in browser → https://$HOST_IP"
    echo ""
    if command -v qrencode >/dev/null; then
        echo "Scan this QR code on your phone:"
        qrencode -t ansiutf8 "https://$HOST_IP"
    fi
    echo ""
    read -p "Press enter to return to menu..."
else
    echo ""
    echo "⚠️  One or more checks failed!"
    echo "Please review the output above."
    echo ""
    read -p "Press Enter to return to menu..."
fi