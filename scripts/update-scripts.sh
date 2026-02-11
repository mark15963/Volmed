#!/bin/bash

echo "Copying scripts..."
sleep 1

cp /var/www/volmed/scripts/*.sh ~/volmed-scripts/
echo "All scripts are copied"
sleep 2

chmod +x ~/volmed-scripts/*.sh
echo "All scripts are executable"
sleep 2

# DEBUGGING: Show what's in the directory
echo "=== DEBUG: Contents of ~/volmed-scripts ==="
ls -la ~/volmed-scripts/
echo "=========================================="
sleep 3

# DEBUGGING: Try to run the control panel directly
echo "Attempting to run control panel..."
~/volmed-scripts/volmed-control.sh
# If we get here, the script continued (meaning the above didn't exec)
echo "If you see this, volmed-control.sh didn't take over!"

# Original exec line
exec ~/volmed-scripts/volmed-control.sh