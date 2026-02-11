#!/bin/bash

echo "╔══════════════════════════════════════╗"
echo "║      VolMed Control Center           ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "=== Updating VolMed Scripts ==="
echo ""
sleep 2
echo "Setting correct ownership..."
chown mark1593:docker ./*.sh 2>/dev/null
echo "Making scripts executable..."
chmod +x ./*.sh 2>/dev/null

echo ""
echo "✅ Update complete!"
echo ""
sleep 1.5

clear
exit 0