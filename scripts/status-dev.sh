#!/bin/bash
# Check VolMed Development Environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.dev.yml"
COMPOSE_PROJECT="volmed-dev"

echo ""
echo "=== VolMed Development Status ==="
echo ""

sudo docker compose \
  -p "$COMPOSE_PROJECT" \
  -f "$COMPOSE_FILE" \
  ps

echo ""
echo "Frontend URL: http://localhost:5173"
echo "Backend URL: http://localhost:5000"
echo ""

if curl -fsS --max-time 3 http://127.0.0.1:5173 >/dev/null 2>&1; then
    echo "✅ Frontend: responding."
else
    echo "❌ Frontend: not responding."
fi

if curl -fsS --max-time 3 http://127.0.0.1:5000/api/health >/dev/null 2>&1; then
    echo "✅ Backend: responding."
else
    echo "❌ Backend: not responding."
fi

echo ""
read -r -p "Press Enter to return to menu..."