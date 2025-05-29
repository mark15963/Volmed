@REM @echo off
@REM title Full-Stack Starter
@REM color 0A

@REM echo Starting VolMed Environment...
@REM echo ----------------------------------------

@REM :: 1. Запуск базы данных (XAMPP)
@REM echo Запуск MySQL...
@REM start /B "" "C:\xampp\xampp_start.exe"

@REM :: 2. Запуск сервера Node.js с помощью PM2
@REM echo Запуск бэкенд-сервера...
@REM start "Сервер VolMed" cmd /k "cd server && pm2 start ecosystem.config.js && pm2 monit"

@REM :: 3. Запуск React-клиента
@REM echo Запуск фронтенда...
@REM start "Клиент VolMed" cmd /k "cd client && npm run dev"

@REM :: 4. Открытие браузера и вывод статуса
@REM timeout /t 5 >nul
@REM echo ----------------------------------------
@REM echo Система успешно запущена!
@REM echo Бэкенд: http://localhost:5000
@REM echo Фронтенд: http://localhost:5173
@REM start "" "http://localhost:5173"


@REM :: Оставить окно открытым
@REM pause


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