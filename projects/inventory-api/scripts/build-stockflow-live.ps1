param(
  [Parameter(Mandatory = $true)]
  [string]$ApiBaseUrl,
  [string]$BasePath = "/apps/stockflow-live/"
)

$ErrorActionPreference = "Stop"
$frontend = Join-Path $PSScriptRoot "..\frontend"
Set-Location $frontend

$env:VITE_USE_LIVE_API = "true"
$env:VITE_API_BASE_URL = $ApiBaseUrl.TrimEnd("/")
$env:VITE_BASE_PATH = $BasePath

Write-Host "Build StockFlow LIVE" -ForegroundColor Cyan
Write-Host "  API: $env:VITE_API_BASE_URL"
Write-Host "  Base: $env:VITE_BASE_PATH"

if (Test-Path "package-lock.json") { npm ci } else { npm install }
npm run build

Write-Host "`nListo: $frontend\dist" -ForegroundColor Green
Write-Host "Sube dist/ a tu hosting en la ruta $BasePath"
