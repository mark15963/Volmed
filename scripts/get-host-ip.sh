#!/bin/bash
# Detects the primary LAN IP (non-loopback, prefers WiFi/Ethernet).
# Outputs: IP like 192.168.1.50 or empty if none found.

INTERFACE=$(ip route | grep default | awk '{print $5}' | head -1)  # Default route interface (e.g., wlan0)
if [ -z "$INTERFACE" ]; then
  INTERFACE=$(ip -o link show | awk -F': ' '{print $2}' | grep -E '^(en|wlan|eth)' | head -1)  # Fallback to first Ethernet/WiFi
fi

if [ -n "$INTERFACE" ]; then
  IP=$(ip addr show $INTERFACE | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -1)
  echo "$IP"
else
  echo ""  # No IP found (e.g., no network)
fi