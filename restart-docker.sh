#!/bin/bash

# Script to restart the VolMed Docker application
set -e

echo "=== Restarting VolMed Docker Deployment ==="

cd /var/www/volmed

# Run stop script
./stop-docker.sh

echo ""
echo "Waiting 5 seconds before restarting..."
sleep 5

# Run start script
./start-docker.sh
