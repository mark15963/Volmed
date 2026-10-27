#!/bin/bash
# Stop VolMed Development Environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.dev.yml"
COMPOSE_PROJECT="volmed-dev"

echo ""
echo "=== Stopping VolMed Development Environment ==="
echo ""

if ! sudo docker compose \
  -p "$COMPOSE_PROJECT" \
  -f "$COMPOSE_FILE" \
  down; then
    echo ""
    echo "❌ ERROR: Failed to stop development containers."
    echo ""
    exit 1
fi

echo ""
echo "✅ Development environment stopped."
echo ""

read -r -p "Press Enter to return to menu..."