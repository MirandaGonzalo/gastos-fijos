@echo off
cd /d "%~dp0"
echo Apagando gastos fijos...
docker compose --profile app down
echo Listo.
timeout /t 2 /nobreak >nul
