@echo off
title Calculadora Digimon - ver pagina
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev\servidor.ps1"
echo.
echo El servidor se cerro. Puedes cerrar esta ventana.
pause >nul
