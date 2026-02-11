#!/bin/bash

# Script to start the VolMed application using Docker
# set -e

echo "=== Starting VolMed Docker Deployment ==="

# Change to project directory
cd /var/www/volmed

echo "1. Stopping any existing Docker containers..."
sudo docker compose down 2>/dev/null || true
echo "✅ Step 1 complete"

echo "2. Starting PostgreSQL (host service)..."
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Enable to start on boot if not already
echo "   PostgreSQL status: $(sudo systemctl is-active postgresql)"
echo "✅ Step 2 complete"

echo "3. Building frontend..."
cd client
sudo npm run build
cd ..
echo "✅ Step 3 complete"

echo "4. Building Docker images..."
sudo docker compose build --no-cache
echo "✅ Step 4 complete"

sleep 5

echo "5. Starting Docker services..."
sudo docker compose up --remove-orphans
echo "✅ Step 5 complete"

sleep 5

echo "6. Waiting for services to be healthy..."
sleep 10
echo "✅ Step 6 complete"

echo "7. Checking service status..."
echo "   Backend: $(sudo docker compose ps backend --format '{{.Status}}')"
echo "   Nginx: $(sudo docker compose ps nginx --format '{{.Status}}')"
echo "   PostgreSQL (host): $(sudo systemctl is-active postgresql)"
echo "✅ Step 7 complete"

echo "8. Testing application..."
if curl -k -s --max-time 5 https://192.168.0.107/api/health > /dev/null; then
    echo "   ✓ Backend API is responding"
else
    echo "   ✗ Backend API is not responding"
fi

if curl -k -s --max-time 5 https://192.168.0.107/ > /dev/null; then
    echo "   ✓ Frontend is serving"
else
    echo "   ✗ Frontend is not serving"
fi
echo "✅ Step 8 complete"

echo ""
echo "============== Deployment Complete ==============="
echo "|                                                |"
echo "|  Frontend: https://192.168.0.107               |"
echo "|  Backend API: https://192.168.0.107/api        |"
echo "|  API Health: https://192.168.0.107/api/health  |"
echo "|                                                |"
echo "=================================================="
echo ""
echo "Press enter to return to menu..."
read

exit 0




# ✅ Step 4 complete
# 5. Starting Docker services...
# [+] up 4/4
#  ✔ Network volmed_default Created                                           0.0s
#  ✔ Container backend      Created                                           0.1s
#  ✔ Container frontend     Created                                           0.1s
#  ✔ Container nginx        Created                                           0.1s
# Attaching to backend, frontend, nginx
# frontend  | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
# frontend  | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
# frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
# frontend  | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
# frontend  | 10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
# frontend  | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
# frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
# frontend  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
# frontend  | /docker-entrypoint.sh: Configuration complete; ready for start up
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: using the "epoll" event method
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: nginx/1.29.5
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: built by gcc 15.2.0 (Alpine 15.2.0) 
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: OS: Linux 6.17.0-12-generic
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1024:524288
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: start worker processes
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: start worker process 30
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: start worker process 31
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: start worker process 32
# frontend  | 2026/02/11 20:29:28 [notice] 1#1: start worker process 33
# backend   | 
# backend   | > server@6.2.0 start
# backend   | > cross-env NODE_ENV=production node server.js
# backend   | 
# Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint nginx (1b2400e7b4861fafe1bd7472e9386cfafef54de7b8621033870c5dbe53270cd7): failed to bind host port 0.0.0.0:80/tcp: address alre