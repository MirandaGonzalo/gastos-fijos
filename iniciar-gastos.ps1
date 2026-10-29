# Levanta la app de gastos fijos y abre el navegador.
#   - Si ya esta levantada y no hubo cambios: abre el navegador directo.
#   - Si cambio el codigo desde el ultimo build: reconstruye.
#   - Si no: levanta lo que ya esta compilado.
# Con -Forzar reconstruye siempre (lo usa actualizar-gastos.cmd).
param([switch]$Forzar)

Set-Location $PSScriptRoot
$url = 'http://localhost:5190'
$marca = Join-Path $PSScriptRoot '.ultimo-build'

function Salir-ConError($mensaje) {
  Write-Host ''
  Write-Host $mensaje -ForegroundColor Red
  Read-Host 'Enter para cerrar'
  exit 1
}

function Docker-Listo {
  docker info *> $null
  return $LASTEXITCODE -eq 0
}

function Esta-Corriendo($nombre) {
  $r = docker ps --filter "name=^$nombre$" --filter 'status=running' --format '{{.Names}}'
  return [bool]$r
}

# 1. Docker Desktop
if (-not (Docker-Listo)) {
  Write-Host 'Abriendo Docker Desktop...'
  $exe = Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'
  if (-not (Test-Path $exe)) { Salir-ConError "No encontre Docker Desktop en $exe. Abrilo a mano y volve a intentar." }
  Start-Process $exe
  $limite = (Get-Date).AddMinutes(3)
  while (-not (Docker-Listo)) {
    if ((Get-Date) -gt $limite) { Salir-ConError 'Docker Desktop no termino de arrancar.' }
    Start-Sleep -Seconds 2
  }
}

# 2. Hubo cambios en el codigo desde el ultimo build?
$ultimoBuild = if (Test-Path $marca) { (Get-Item $marca).LastWriteTime } else { [datetime]::MinValue }
$rutas = @(
  'frontend\src', 'frontend\public', 'frontend\index.html', 'frontend\package.json', 'frontend\nginx.conf', 'frontend\Dockerfile',
  'backend\src', 'backend\prisma', 'backend\package.json', 'backend\Dockerfile', 'docker-compose.yml'
)
$cambio = Get-ChildItem $rutas -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\generated\\' -and $_.LastWriteTime -gt $ultimoBuild } |
  Select-Object -First 1
$hayQueConstruir = $Forzar -or [bool]$cambio

# 3. Ya esta levantada y al dia? Abrir y listo
if (-not $hayQueConstruir -and (Esta-Corriendo 'gastos-fijos-web') -and (Esta-Corriendo 'gastos-fijos-api')) {
  Write-Host 'La app ya estaba levantada.'
  Start-Process $url
  exit 0
}

# 4. Levantar (reconstruyendo si hace falta)
if ($hayQueConstruir) {
  if ($cambio) { Write-Host "Hay cambios en el codigo (ej: $($cambio.Name)). Reconstruyendo, puede tardar unos minutos..." }
  else { Write-Host 'Reconstruyendo, puede tardar unos minutos...' }
  docker compose --profile app up -d --build
  if ($LASTEXITCODE -ne 0) { Salir-ConError 'Fallo el build. Revisa el mensaje de arriba.' }
  Set-Content -Path $marca -Value (Get-Date -Format o)
} else {
  Write-Host 'Levantando gastos fijos...'
  docker compose --profile app up -d
  if ($LASTEXITCODE -ne 0) { Salir-ConError 'No se pudo levantar la app. Revisa el mensaje de arriba.' }
}

# 5. Esperar a que la API responda (aplica migraciones al arrancar)
Write-Host 'Esperando a que la app este lista...'
$limite = (Get-Date).AddSeconds(90)
do {
  try {
    $r = Invoke-WebRequest "$url/api/categories" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { break }
  } catch { Start-Sleep -Seconds 2 }
} while ((Get-Date) -lt $limite)

Start-Process $url
