#!/bin/bash

# Script to check the status of VolMed Docker application
clear
echo "=== VolMed Status ==="
echo ""

echo -n "Detecting current IP... "
HOST_IP=$(./get-host-ip.sh 2>/dev/null)

if [ -z "$HOST_IP" ]; then
    HOST_IP="localhost"
    echo "failed → using localhost"
else
    echo "$HOST_IP"
fi
echo ""

echo "Docker Services Status:"
sudo docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"
echo ""

echo "Service health:"
echo -n "  PostgreSQL:     "; sudo systemctl is-active postgresql 2>/dev/null || echo "inactive"

echo -n "  Backend API:    "
if curl -k -s --max-time 4 "https://${HOST_IP}/api/health" >/dev/null; then
    echo "✓ up (https)"
elif curl -s --max-time 4 "http://${HOST_IP}/api/health" >/dev/null; then
    echo "✓ up (http fallback)"
else
    echo "✗ down"
    echo "      tried: https://${HOST_IP}/api/health"
    echo "         &  http://${HOST_IP}/api/health"
fi

echo -n "  Frontend:       "
if curl -k -s --max-time 4 "https://${HOST_IP}/" >/dev/null; then
    echo "✓ up (https)"
elif curl -s --max-time 4 "http://${HOST_IP}/" >/dev/null; then
    echo "✓ up (http fallback)"
else
    echo "✗ down"
    echo "      tried: https://${HOST_IP}/"
    echo "         &  http://${HOST_IP}/"
fi

echo ""

echo "Resource Usage:"
sudo docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || echo "  (no running containers)"

echo ""
echo "Current access URL: https://${HOST_IP} (or http://${HOST_IP} if HTTPS not working)"
echo ""
read -p "Press Enter to return..."
exit 0