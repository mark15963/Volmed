#!/bin/bash

# Script to start the VolMed application using Docker
# set -e

clear
echo ""
echo "=== Starting VolMed Docker Deployment ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$SCRIPT_DIR/lib"

# Load helpers + functions into THIS shell
# shellcheck source=lib/common.sh
source "$LIB/common.sh"
# shellcheck source=lib/deploy-function.sh
source "$LIB/deploy-functions.sh"

step "1. Starting PostgreSQL (host service)..."
start_postgres || die "Postgres failed"

step "2. Detecting current network IP..."
find_ip
export HOST_IP

step "3. Building frontend..."
build_frontend

step "4. Building Docker images..."
build_docker || die "Docker build failed"

step "5. Starting Docker services..."
start_docker_services || die "Docker start failed"

step "6. Waiting for services to be healthy..."
wait_healthy || die "Services never became healthy"

step "7. Checking service status..."
check_status

step "8. Testing application on detected IP ($HOST_IP)..."
sleep 2

if test_app; then
    sleep 2
    clear
    "$SCRIPT_DIR/status-docker.sh"
else
    echo ""
    echo "⚠️  One or more checks failed!"
    echo "Please review the output above."
    echo ""
    read -p "Press Enter to return to menu..."
fi