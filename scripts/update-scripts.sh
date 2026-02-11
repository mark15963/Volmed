#!/bin/bash

echo "=== Updating VolMed Scripts ==="
echo ""

# Create directory if it doesn't exist
mkdir -p ~/volmed-scripts

# Copy scripts from the correct source path with sudo
echo "Copying scripts from /var/www/volmed/scripts/..."
sudo cp /var/www/volmed/scripts/*.sh ~/volmed-scripts/ 2>/dev/null

# Check if copy succeeded
if [ $? -eq 0 ]; then
    echo "✅ Scripts copied successfully"
else
    echo "❌ No scripts found in /var/www/volmed/scripts/"
    echo "   Make sure the source directory exists"
fi

# Fix ownership - this is the KEY step you're missing!
echo "Setting correct ownership..."
sudo chown mark1593:docker ~/volmed-scripts/*.sh 2>/dev/null

# Make executable
echo "Making scripts executable..."
sudo chmod +x ~/volmed-scripts/*.sh 2>/dev/null

echo ""
echo "✅ Update complete!"
echo ""
echo "Press Enter to return to control panel..."
read

# REMOVE the exec! Just exit normally
exit 0