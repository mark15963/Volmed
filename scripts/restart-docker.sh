#!/bin/bash

# Script to restart the VolMed Docker application
set -e

echo "=== Restarting VolMed Docker Deployment ==="
sleep 2 

# Run stop script
./stop-docker.sh

# Run start script
./start-docker.sh

exit 0