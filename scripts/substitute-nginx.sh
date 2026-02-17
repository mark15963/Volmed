#!/bin/sh

set -e

envsubst '${HOST_IP}' < /etc/nginx/conf.d/volmed.conf.template > /etc/nginx/conf.d/volmed.conf
exec nginx -g 'daemon off;'