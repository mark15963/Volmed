#!/bin/bash

cp /var/www/volmed/scripts/*.sh ~/volmed-scripts/
echo "All scripts are copied"
sleep 2

chmod +x ~/volmed-scripts/*.sh
echo "All scripts are executable"
sleep 2

exec ~/volmed-scripts/volmed-control.sh