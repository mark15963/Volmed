#!/bin/bash
# Sourced by start-docker.sh — do NOT execute directly.

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && {
    echo "This file is meant to be sourced, not executed." >&2
    exit 1
}

# ---------------------------------------------------------------------------
# Step 1 — PostgreSQL (host service)
# ---------------------------------------------------------------------------
start_postgres() {
    sudo systemctl start postgresql
    sudo systemctl enable postgresql >/dev/null 2>&1
    local st
    st=$(sudo systemctl is-active postgresql)
    if [ "$st" = "active" ]; then
        ok "PostgreSQL status: $st" 
    else
        err "PostgreSQL status: $st"
    fi
}

# ---------------------------------------------------------------------------
# Step 2 — Detect host IP and update .env
# Sets global: HOST_IP
# ---------------------------------------------------------------------------
find_ip() {
    # Finds and returns the current LAN IP
    local ip
    ip=$("$SCRIPT_DIR/get-host-ip.sh")

    if [ -z "$ip" ]; then
        ip="127.0.0.1"
        warn "No LAN IP detected → using 127.0.0.1"
    else
        info "Using IP: $ip"
    fi

    # Update .env with new IP
    sed -i "s/^HOST_IP=.*/HOST_IP=$ip/" "$SCRIPT_DIR/../.env"
    HOST_IP="$ip"
}

# ---------------------------------------------------------------------------
# Step 3 — Build frontend
# ---------------------------------------------------------------------------
build_frontend() {
    local dir="/var/www/volmed/client"
    [ -d "$dir" ] || die "Client folder not found: $dir"

    ( cd "$dir" && npm run build )
    
    local build_exit_code=$?

    if [ $build_exit_code -ne 0 ]; then
        echo ""
        echo "❌ ERROR: Frontend build failed with code $build_exit_code"
        echo "Check the output above for details."
        echo ""
        # PAUSE HERE so you can read the error
        read -p "Press Enter to continue..."
        die "Frontend build failed"
    fi
    
    ok "Frontend built"
}

# ---------------------------------------------------------------------------
# Step 4 — Build Docker images
# ---------------------------------------------------------------------------
build_docker() {
    local logdir="$SCRIPT_DIR/../logs"
    mkdir -p "$logdir"
    local logfile="$logdir/docker-build-$(date +%Y%m%d-%H%M%S).log"
    info "Build log: $logfile"
    
    set -o pipefail
    if ! ( cd "$SCRIPT_DIR/.." && sudo docker compose build ) 2>&1 | tee "$logfile"; then
        err "Docker build failed"
        echo ""
        info "Error context:"
        grep -A 8 -E '^Dockerfile:[0-9]+[[:space:]]*$' "$logfile" \
            || echo "  (no Dockerfile:N pattern found — see log below)"
        echo ""
        info "Last 20 lines of the log:"
        tail -20 "$logfile"
        echo ""
        info "Full log: $logfile"
        [ -t 0 ] && read -p "Press Enter to continue..." _
        return 1
    fi
    ok "Docker built"
    return 0
}

# ---------------------------------------------------------------------------
# Step 5 — Start Docker services
# ---------------------------------------------------------------------------
start_docker_services() {
    local pids
    pids=$(sudo docker ps -q --filter "publish=80" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        info "Stopping containers using port 80: $pids"
        sudo docker stop $pids >/dev/null
    fi
    sudo fuser -k 80/tcp 2>/dev/null || true
    sleep 1

    local logdir="$SCRIPT_DIR/../logs"
    mkdir -p "$logdir"
    local logfile="$logdir/docker-up-$(date +%Y%m%d-%H%M%S).log"

    set -o pipefail
    if ! ( cd "$SCRIPT_DIR/.." && sudo docker compose up -d --remove-orphans ) 2>&1 | tee "$logfile" ; then
        err "Docker compose up failed"
        echo ""
        info "Last 40 lines:"
        tail -40 "$logfile"
        [ -t 0 ] && read -p "Press Enter to continue..." _
        return 1
    fi
    ok "Docker started"
}

# ---------------------------------------------------------------------------
# Step 6 — Wait for healthy
# ---------------------------------------------------------------------------
wait_healthy() {
    local tries=0
    until curl -sk --max-time 2 "https://${HOST_IP}/api/health" >/dev/null 2>&1; do
        tries=$((tries + 1))
        if [ "$tries" -ge 30 ]; then 
            err "Services did not become healthy in time"
            echo ""
            info "Container states:"
            sudo docker compose ps
            echo ""
            info "Recent container logs:"
            sudo docker compose logs --tail=20
            [ -t 0 ] && read -p "Press Enter to continue..." _
            return 1
        fi
        echo -n "."
        sleep 2
    done
    echo ""
    ok "Services are healthy"
}

# ---------------------------------------------------------------------------
# Step 7 — Status summary
# ---------------------------------------------------------------------------
check_status() {
    info "Backend:  $(sudo docker compose ps backend --format '{{.Status}}')"
    info "Nginx:    $(sudo docker compose ps nginx --format '{{.Status}}')"
    info "Postgres: $(sudo systemctl is-active postgresql)"
}

# ---------------------------------------------------------------------------
# Step 8 — Smoke test
# Returns 0 if both backend & frontend respond, 1 otherwise.
# ---------------------------------------------------------------------------
test_app() {
    local backend_ok=false 
    local frontend_ok=false

    echo -n "   Backend API (/api/health) ... "
    if curl -k -s --max-time 5 "https://$HOST_IP/api/health" >/dev/null; then
        echo "${C_GREEN}https${C_RESET}" 
        backend_ok=true
    elif curl -s --max-time 5 "http://$HOST_IP/api/health" >/dev/null; then
        echo "${C_GREEN}http fallback${C_RESET}"
        backend_ok=true
    else
        echo "${C_RED}not responding${C_RESET}"
    fi

    echo -n "   Frontend (/) ............ "
    if curl -k -s --max-time 5 "https://$HOST_IP/" >/dev/null; then
        echo "${C_GREEN}https${C_RESET}"
        frontend_ok=true
    elif curl -s --max-time 5 "http://$HOST_IP/" >/dev/null; then
        echo "${C_GREEN}http fallback${C_RESET}"
        frontend_ok=true
    else
        echo "${C_RED}not serving${C_RESET}"
    fi

    $backend_ok && $frontend_ok
}