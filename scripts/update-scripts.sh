#!/bin/bash

cd /var/www/volmed

cp /scripts/*.sh ~/volmed-scripts/
echo "All scripts are copied"
sleep 2

chmod +x ~/volmed-scripts/*.sh
echo "All scripts are executable"
sleep 2
read
exec ~/volmed-scripts/volmed-control.sh