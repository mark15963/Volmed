#!/bin/bash

# Script to stop the VolMed Docker application
set -e

echo "===== Stopping VolMed Docker Deployment ====="
echo ""
echo "1. Stopping Docker services..."
sudo docker compose down --remove-orphans 2> /dev/null || true

echo "2. Stopping PostgreSQL (host service)..."
sudo systemctl stop postgresql 2>/dev/null || true
echo "   PostgreSQL stopped"

echo "3. Cleaning up Docker resources..."
sudo docker container prune -f 2>/dev/null || true
sudo docker image prune -f 2>/dev/null || true

echo ""
echo "=========== All Services Stopped ============"
sleep 2
exit 0