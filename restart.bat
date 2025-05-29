@echo off
chcp 65001 >nul
title VolMed: Restart Server
color 0C

echo Перезапуск сервера VolMed...
echo ----------------------------------------

echo [1/4] Проверка PM2...
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo Ошибка: PM2 не установлен или не в PATH
    echo Установите: npm install pm2 -g
    pause
    exit /b
)

echo [2/4] Переход в папку server...
cd /d "%~dp0server" || (
    echo Ошибка: Папка server не найдена
    pause
    exit /b
)

echo [3/4] Перезапуск сервера...
pm2 restart ecosystem.config.js
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось перезапустить сервер
    echo Попробуйте запустить вручную: 
    echo   cd server
    echo   pm2 start ecosystem.config.js
    pause
    exit /b
)

echo [4/4] Открытие мониторинга...
start "PM2 Monitor" cmd /k "pm2 monit"

:: 7. Статус
echo ----------------------------------------
echo Сервер успешно перезапущен!
echo Бэкенд: http://localhost:5000
echo Фронтенд: http://localhost:5173
echo ----------------------------------------
timeout /t 3 >nul
exit