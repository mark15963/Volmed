#!/bin/bash
# VolMed Control Center

cd "$(dirname "$0")" || exit 1

error_message=""

if [ -z "$FLAG" ]; then
    ./update-sctipts.sh
    export FLAG=1
fi

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
    echo "║  9) Start DEV MODE                   ║"
    echo "║  10) Stop DEV MODE                   ║"
    echo "║  11) DEV MODE status                 ║"
    echo "║  12) DEV MODE logs                   ║"
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
    read -p "Select option [1-12, 0]: " choice

    case $choice in
        1)
            clear
            echo "Starting VolMed..."
            ./start-docker.sh
            ;;
        2)
            clear
            echo "Stopping VolMed..."
            ./stop-docker.sh
            ;;
        3)
            clear
            echo "Restarting VolMed..."
            ./restart-docker.sh
            ;;
        4)
            clear
            echo "Checking status..."
            ./status-docker.sh
            ;;
        5)
            clear
            echo "Showing logs (Ctrl+C to exit)..."
            cd /var/www/volmed
            docker compose logs -f
            echo ""
            read -p "Press Enter to return to menu..."
            ;;
        6)
            clear
            echo "Updating scripts..."
            ./update-scripts.sh
            ;;
        7)
            clear
            echo "Updating code..."
            ./deploy.sh
            ;;
        8)
            echo "Opening browser..."
            xdg-open https://192.168.0.107 2>/dev/null
            echo ""
            read -p "Press Enter to return to menu..."
            ;;
        9)
            clear
            echo "Starting app in DEV MODE..."
            ./start-dev.sh
            ;;
        10)
            clear
            echo "Stopping app in DEV MODE..."
            ./stop-dev.sh
            ;;
        11)
            clear
            echo "Checking DEV MODE status..."
            ./status-dev.sh
            ;;
        12)
            clear
            echo "Showing DEV MODE logs (Ctrl+C to exit)..."
            ./logs-dev.sh
            ;;
        0)
            echo "Exiting..."
            exit 0
            ;;
        *)
            error_message="Invalid option: '$choice'. Please select 1-12 or 0"
            ;;
    esac
done


