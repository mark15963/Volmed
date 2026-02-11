#!/bin/bash

echo "=== Updating VolMed Scripts ==="
echo ""
sleep 5


# Fix ownership - this is the KEY step you're missing!
echo "Setting correct ownership..."
chown mark1593:docker ./*.sh 2>/dev/null

# Make executable
echo "Making scripts executable..."
chmod +x ./*.sh 2>/dev/null

echo ""
echo "✅ Update complete!"
echo ""
echo "Press Enter to return to control panel..."
read

# REMOVE the exec! Just exit normally
exit 0