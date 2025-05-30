@echo off
chcp 65001 >nul
title VolMed Launcher (Администратор)

:: Проверка наличия Windows Terminal
where wt >nul 2>&1
if %errorlevel% neq 0 (
    echo Ошибка: Windows Terminal не установлен
    echo Установите из Microsoft Store: https://aka.ms/terminal
    pause
    exit /b
)

:: 2. Запуск MySQL (без окна)
echo Запуск MySQL...
start /B "" "C:\xampp\xampp_start.exe" >nul 2>&1

:: 3. Запуск сервера Node.js
echo Запуск бэкенд-сервера...
start "Сервер" cmd /k "cd /d %~dp0server && pm2 start ecosystem.config.js && echo Запуск завершен. && echo Сервер: http://localhost:5000, && echo Клиент локальный: http://localhost:5173 && pause &&exit"

:: 4. Запуск React-клиента
echo Запуск фронтенда...
start "Клиент" cmd /k "cd /d %~dp0client && npm run dev && pause && exit"

:: 5. Запуск мониторинга PM2
echo Запуск мониторинга...
start "PM2 Монитор" cmd /k "cd /d %~dp0server && pm2 monit && exit"

:: Открытие браузера через 3 сек
timeout /t 3 >nul
start "" "http://localhost:5173"

echo ----------------------------------------
echo Система успешно запущена!
echo Бэкенд: http://localhost:5000
echo Фронтенд: http://localhost:5173
echo ----------------------------------------
exit