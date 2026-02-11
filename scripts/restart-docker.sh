#!/bin/bash

set -e

echo "=== Restarting VolMed Docker Deployment ==="
sleep 2 

./stop-docker.sh
./start-docker.sh

exit 0