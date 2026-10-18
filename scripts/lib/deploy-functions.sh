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
    ( cd "$SCRIPT_DIR/.." && sudo docker compose build --no-cache ) \
        || die "Docker build failed"
    ok "Docker built"
}

# ---------------------------------------------------------------------------
# Step 5 — Start Docker services
# ---------------------------------------------------------------------------
start_docker_services() {
    sudo fuser -k 80/tcp 2>/dev/null || true
    ( cd "$SCRIPT_DIR/.." && sudo docker compose up -d --remove-orphans ) \
        || die "Docker compose up failed"
    ok "Docker started"
}

# ---------------------------------------------------------------------------
# Step 6 — Wait for healthy
# ---------------------------------------------------------------------------
wait_healthy() {
    local tries=0
    until curl -sk --max-time 2 "https://${HOST_IP}/api/health" >/dev/null 2>&1; do
        tries=$((tries + 1))
        [ "$tries" -ge 30 ] && die "Services did not become healthy in time"
        sleep 2
    done
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