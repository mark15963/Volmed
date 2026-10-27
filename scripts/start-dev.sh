#!/bin/bash
# Start the VolMed application in development mode

set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.dev.yml"
COMPOSE_PROJECT="volmed-dev"

cd "$PROJECT_DIR" || exit 1

clear
echo ""
echo "=== Starting VolMed in Development Mode ==="
echo ""

# ---------------------------------------------------------------------------
# Step 1 — Start PostgreSQL
# ---------------------------------------------------------------------------
echo "[1/5] Starting PostgreSQL..."
if ! sudo systemctl start postgresql; then
    echo "ERROR: Failed to start PostgreSQL."
    exit 1
fi

echo "PostgreSQL is running."

# ---------------------------------------------------------------------------
# Step 2 — Check configuration
# ---------------------------------------------------------------------------
echo "[2/5] Checking Docker and Compose configuration..."

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ ERROR: Docker is not installed or not in PATH."
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ ERROR: Docker Compose file not found:" 
    echo "          $COMPOSE_FILE"
    exit 1
fi

if ! sudo docker compose \
  -p "$COMPOSE_PROJECT" \
  -f "$COMPOSE_FILE" \
  config --quiet; then
    echo "❌ ERROR: Docker Compose configuration is invalid."
    exit 1
fi

echo "✅ Docker and Compose configuration is valid."

# ---------------------------------------------------------------------------
# Step 3 — Build and start development containers
# ---------------------------------------------------------------------------
echo ""
echo "[3/5] Building and starting development containers..."

if ! sudo docker compose \
  -p "$COMPOSE_PROJECT" \
  -f "$COMPOSE_FILE" \
  up --build -d; then

  echo ""
  echo "❌ ERROR: Failed to build or start development containers."
  echo ""
  sudo docker compose \
    -p "$COMPOSE_PROJECT" \
    -f "$COMPOSE_FILE" \
    logs --tail=50
  
  echo ""
  read -p "Press Enter to return to menu..."
  exit 1
fi

echo "Development containers started."

# ---------------------------------------------------------------------------
# Step 4 — Wait for services
# ---------------------------------------------------------------------------
echo ""
echo "[4/5] Waiting for frontend and backend..."

FRONTEND_URL="http://127.0.0.1:5173"
BACKEND_URL="http://127.0.0.1:5000/api/health"

wait_for_url() {
    local url="$1"
    local name="$2"
    local max_attempts=30
    local attempt=0

    while [ $attempt -le $max_attempts ]; do
        if curl -fsS --max-time 2 "$url" >/dev/null 2>&1; then
            echo "✅ $name is up at $url"
            return 0
        fi

        attempt=$((attempt + 1))
        sleep 2
    done

    echo "❌ ERROR: $name did not become available at $url after $max_attempts attempts."
    return 1
}

frontend_ok=false
backend_ok=false

if wait_for_url "$FRONTEND_URL" "Vite frontend"; then
    frontend_ok=true
fi

if wait_for_url "$BACKEND_URL" "Express backend health endpoint"; then
    backend_ok=true
fi

# ---------------------------------------------------------------------------
# Step 5 — Summary
# ---------------------------------------------------------------------------
echo ""
echo "[5/5] Development status"
echo ""

sudo docker compose \
  -p "$COMPOSE_PROJECT" \
  -f "$COMPOSE_FILE" \
  ps

echo ""
echo "Frontend URL: http://localhost:5173"
echo "Backend URL:  http://localhost:5000"
echo ""

if [ "$frontend_ok" = true ] && [ "$backend_ok" = true ]; then
    echo "✅ VolMed is running in development mode."
else
    echo "⚠️  One or more services failed to start properly."
    echo "Please check the logs above for details."
    echo ""
    echo "sudo docker compose -p $COMPOSE_PROJECT -f $COMPOSE_FILE logs --tail=50"
fi

echo ""
read -r -p "Press Enter to return to menu..."
