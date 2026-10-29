# Crea en el escritorio el acceso directo "Gastos" con el icono de la calculadora.
# Se puede volver a correr si moves la carpeta del proyecto.
$proyecto = $PSScriptRoot
$escritorio = [Environment]::GetFolderPath('Desktop')

$shell = New-Object -ComObject WScript.Shell
$acceso = $shell.CreateShortcut((Join-Path $escritorio 'Gastos.lnk'))
$acceso.TargetPath = Join-Path $proyecto 'iniciar-gastos.cmd'
$acceso.WorkingDirectory = $proyecto
$acceso.IconLocation = Join-Path $proyecto 'frontend\src\assets\gastos.ico'
$acceso.WindowStyle = 7   # ventana minimizada: solo se ve el navegador
$acceso.Description = 'Abrir la app de gastos fijos'
$acceso.Save()

Write-Host "Acceso directo 'Gastos' creado en $escritorio"
