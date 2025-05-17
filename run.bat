@echo off
start "Server" cmd /k "cd server && npm run dev"
start "Client" cmd /k "cd client && npm run dev"