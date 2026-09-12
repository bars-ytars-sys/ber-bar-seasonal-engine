@echo off
chcp 65001 >nul
title NE GASNUT
echo Stavlyu: komp ne spit / ne gibernejtit / diski ne otklyuchayutsya
echo.
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
powercfg /change disk-timeout-ac 0
powercfg /change disk-timeout-dc 0
echo.
echo GOTOVO. Komp bolshe ne zasnet. Ekran mozhet tuhnut - eto normalno.
echo Okno mozhno zakryt.
echo.
pause
