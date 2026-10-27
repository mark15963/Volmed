#!/bin/bash
# View VolMed Development Logs

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.dev.yml"
COMPOSE_PROJECT="volmed-dev"

cd "$PROJECT_DIR" || exit 1

echo "Showing development logs. Press Ctrl+C to return."

sudo docker compose \
    -p "$COMPOSE_PROJECT" \
    -f "$COMPOSE_FILE" \
    logs -f --tail=100

echo ""
read -r -p "Press Enter to return to the menu..."