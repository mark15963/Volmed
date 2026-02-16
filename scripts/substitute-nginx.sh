#!/bin/bash

set -e

envsubst '${HOST_IP}' < /etc/nginx/conf.d/volmed.conf.template > /etc/nginx/conf.d/volmed.conf

# openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/nginx-selfsigned.key -out ssl/nginx-selfsigned.crt -subj "/CN=${HOST_IP}"