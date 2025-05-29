@echo off
chcp 65001 >nul
cd server
pm2 delete all
taskkill /IM node.exe /F
echo Все услуги остановлены
pause
exit