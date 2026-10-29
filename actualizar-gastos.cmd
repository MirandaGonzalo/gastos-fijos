@echo off
rem Fuerza la reconstruccion completa (normalmente no hace falta: iniciar-gastos detecta los cambios)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-gastos.ps1" -Forzar
pause
