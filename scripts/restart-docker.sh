#!/bin/bash

# Script to restart the VolMed Docker application
set -e

echo "=== Restarting VolMed Docker Deployment ==="

cd /var/www/volmed

# Run stop script
./stop-docker.sh

# Run start script
exec ./start-docker.sh
