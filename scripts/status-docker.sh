#!/bin/bash

# Script to check the status of VolMed Docker application
set -e

echo "=== VolMed Docker Application Status ==="
echo ""

cd /var/www/volmed

echo "1. Docker Services Status:"
docker compose ps

echo ""
echo "2. Service Health Checks:"
echo "   PostgreSQL (host): $(systemctl is-active postgresql 2>/dev/null || echo 'Not running')"

# Test backend
echo -n "   Backend API: "
if curl -k -s --max-time 3 https://192.168.0.107/api/health > /dev/null; then
    echo "✓ Healthy"
else
    echo "✗ Not responding"
fi

# Test frontend
echo -n "   Frontend: "
if curl -k -s --max-time 3 https://192.168.0.107/ > /dev/null; then
    echo "✓ Serving"
else
    echo "✗ Not serving"
fi

echo ""
echo "3. Resource Usage:"
sudo docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | sed 's/^/     /' || echo "   Cannot retrieve stats"

echo ""
echo "Press Enter to return to control panel..."
read

exit 0