#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$SCRIPT_DIR/lib"
# Load helpers + functions into THIS shell
# shellcheck source=lib/common.sh
source "$LIB/common.sh"
# shellcheck source=lib/deploy-function.sh
source "$LIB/deploy-functions.sh"

# Script to check the status of VolMed Docker application
clear
echo "=== VolMed Status ==="
echo ""

if [ -z "${HOST_IP:-}" ]; then
    echo -n "Detecting current IP... "
    HOST_IP=$("$SCRIPT_DIR/get-host-ip.sh" 2>/dev/null)
    if [ -z "$HOST_IP" ]; then
        HOST_IP="localhost"
        warn "failed → using localhost"
    else
        echo "$HOST_IP"
    fi
    echo ""
fi
echo ""

echo "Docker Services Status:"
( cd "$SCRIPT_DIR/.." && sudo docker compose ps \
    --format "table {{.Name}}\t{{.State}}\t{{.Status}}" )
echo ""

echo "Service health:"
echo -n "  PostgreSQL:     "
if systemctl is-active --quiet postgresql ; then
    ok "up"
else
    err "down"
fi

echo -n "  Backend API:    "
if curl -k -s --max-time 4 "https://${HOST_IP}/api/health" >/dev/null; then
    ok "up (https)"
elif curl -s --max-time 4 "http://${HOST_IP}/api/health" >/dev/null; then
    ok "up (http fallback)"
else
    err "down"
    log "      tried: https://${HOST_IP}/api/health"
    log "         &  http://${HOST_IP}/api/health"
fi

echo -n "  Frontend:       "
if curl -k -s --max-time 4 "https://${HOST_IP}/" >/dev/null; then
    ok "up (https)"
elif curl -s --max-time 4 "http://${HOST_IP}/" >/dev/null; then
    ok "up (http fallback)"
else
    err "down"
    log "      tried: https://${HOST_IP}/"
    log "         &  http://${HOST_IP}/"
fi

echo ""

echo "Resource Usage:"
( cd "$SCRIPT_DIR/.." && sudo docker stats --no-stream \
    --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null \
    || log "  (no running containers)" )

echo ""
echo "Current access URL: https://${HOST_IP} (or http://${HOST_IP} if HTTPS not working)"
echo ""
read -p "Press Enter to return..."
exit 0