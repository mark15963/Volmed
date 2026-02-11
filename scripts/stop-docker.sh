#!/bin/bash

# Script to stop the VolMed Docker application
set -e

echo "=== Stopping VolMed Docker Deployment ==="

# Change to project directory
cd /var/www/volmed

echo "1. Stopping Docker services..."
docker compose down

echo "2. Stopping PostgreSQL (host service)..."
systemctl stop postgresql
echo "   PostgreSQL stopped"

echo "3. Cleaning up Docker resources..."
# Remove unused containers
docker container prune -f 2>/dev/null || true
# Remove unused images
docker image prune -f 2>/dev/null || true
# Remove unused volumes (be careful with this)
# docker volume prune -f 2>/dev/null || true

echo ""
echo "=== All Services Stopped ==="
echo ""
sleep 3
exit 0