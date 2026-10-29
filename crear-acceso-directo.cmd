@echo off
rem Doble clic: crea el acceso directo 'Gastos' en el escritorio
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0crear-acceso-directo.ps1"
pause
