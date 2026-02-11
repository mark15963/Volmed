#!/bin/bash
# VolMed Control Center

error_message=""

while true; do
    clear
    echo "╔══════════════════════════════════════╗"
    echo "║      VolMed Control Center           ║"
    echo "╠══════════════════════════════════════╣"
    echo "║  1) Start Application                ║"
    echo "║  2) Stop Application                 ║"
    echo "║  3) Restart Application              ║"
    echo "║  4) Check Status                     ║"
    echo "║  5) View Logs                        ║"
    echo "║  6) Update scripts                   ║"
    echo "║  7) Update code                      ║"
    echo "║  8) Open in Browser                  ║"
    echo "║                                      ║"
    echo "║  0) Exit                             ║"
    echo "╚══════════════════════════════════════╝"

    if [ -n "$error_message" ]; then
        echo ""
        echo "⚠️  $error_message"
        echo ""
        error_message=""
    fi

    echo ""
    read -p "Select option [1-8, 0]: " choice

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
            docker compose logs -f
            echo ""
            read -p "Press Enter to return to menu..."
            ;;
        6)
            echo "Updating scripts..."
            sleep 2
            ./update-scripts.sh
            sleep 20
            ;;
        7)
            echo "Updating code..."
            /var/www/volmed/scripts/deploy.sh
            ;;
        8)
            echo "Opening browser..."
            xdg-open https://192.168.0.107
            echo ""
            read -p "Press Enter to return to menu..."
            ;;
        0)
            echo "Exiting..."
            exit 0
            ;;
        *)
            error_message="Invalid option: '$choice'. Please select 1-8 or 0"
            ;;
    esac
done



# Updating scripts...
# /var/www/volmed/scripts/volmed-control.sh: line 60: ./update-scripts.sh: No such file or directory
