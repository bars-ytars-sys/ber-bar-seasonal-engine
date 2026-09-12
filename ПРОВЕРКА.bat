@echo off
chcp 65001 >nul
title PROVERKA
powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE > "%~dp0proverka-rezultat.txt" 2>&1
powercfg /query SCHEME_CURRENT SUB_DISK DISKIDLE >> "%~dp0proverka-rezultat.txt" 2>&1
echo NE=== >> "%~dp0proverka-rezultat.txt"
echo Gotovo. Fajl proverka-rezultat.txt zapisan.
pause
