#!/bin/bash

# Script to check the status of VolMed Docker application
clear
echo "=== VolMed Status ==="
echo ""

echo "Docker Services Status:"
sudo docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"
echo ""

echo "Service health:"
echo -n "  PostgreSQL:     "; sudo systemctl is-active postgresql 2>/dev/null || echo "inactive"
echo -n "  Backend API:    "; curl -k -s --max-time 4 https://192.168.0.107/api/health >/dev/null && echo "✓ up" || echo "✗ down"
echo -n "  Frontend:       "; curl -k -s --max-time 4 https://192.168.0.107/         >/dev/null && echo "✓ up" || echo "✗ down"
echo ""

echo "Resource Usage:"
sudo docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || echo "  (no running containers)"

echo ""
read -p "Press Enter to return..."
exit 0