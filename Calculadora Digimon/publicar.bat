@echo off
title Digimon Analytics - publicar
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev\publicar.ps1"
