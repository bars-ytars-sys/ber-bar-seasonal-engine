@echo off
rem Запуск телеграм-бота Ber&Bar. Двойной клик по этому файлу — бот работает,
rem пока окно открыто. Закрыть окно = выключить бота.
title Ber^&Bar telegram bot
cd /d "%~dp0.."
:start
node telegram\bot.mjs
echo.
echo Бот остановился. Перезапуск через 5 секунд, Ctrl+C — выйти.
timeout /t 5 /nobreak >nul
goto start
