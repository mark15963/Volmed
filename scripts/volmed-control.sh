#!/bin/bash
# VolMed Control Center

clear
echo "╔══════════════════════════════════════╗"
echo "║      VolMed Control Center           ║"
echo "╠══════════════════════════════════════╣"
echo "║  1) Start Application                ║"
echo "║  2) Stop Application                 ║"
echo "║  3) Restart Application              ║"
echo "║  4) Check Status                     ║"
echo "║  5) View Logs                        ║"
echo "║  6) Open in Browser                  ║"
echo "║  7) Exit                             ║"
echo "╚══════════════════════════════════════╝"
echo ""
read -p "Select option [1-7]: " choice

case $choice in
    1)
        echo "Starting VolMed..."
        ~/volmed-scripts/start-docker.sh
        ;;
    2)
        echo "Stopping VolMed..."
        ~/volmed-scripts/stop-docker.sh
        ;;
    3)
        echo "Restarting VolMed..."
        ~/volmed-scripts/restart-docker.sh
        ;;
    4)
        echo "Checking status..."
        ~/volmed-scripts/status-docker.sh
        ;;
    5)
        echo "Showing logs (Ctrl+C to exit)..."
        cd /var/www/volmed
        sudo docker compose logs -f
        ;;
    6)
        echo "Opening browser..."
        xdg-open https://192.168.0.107
        ;;
    7)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        ;;
esac

read -p "Press Enter to continue..."
