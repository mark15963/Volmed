#!/bin/bash

echo "Copying scripts..."

cp var/www/volmed/*.sh ~/volmed-scripts/
echo "All scripts are copied"

chmod +x ~/volmed-scripts/*.sh
echo "All scripts are executable"

sleep 2
