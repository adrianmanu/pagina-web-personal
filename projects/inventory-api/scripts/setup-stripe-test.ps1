<#
.SYNOPSIS
  Configura Stripe en modo test para membresías StockFlow.

.DESCRIPTION
  Crea productos Starter (USD 19/mes) y Pro (USD 39/mes) si no existen,
  actualiza projects/inventory-api/.env y muestra cómo escuchar webhooks localmente.

.PARAMETER ApiKey
  Clave secreta de test: sk_test_...

.PARAMETER WebhookSecret
  Opcional. whsec_... de `stripe listen` o del dashboard. Si se omite, deja placeholder.

.PARAMETER PriceStarter
  Opcional. price_... existente para Starter (omite creación).

.PARAMETER PricePro
  Opcional. price_... existente para Pro (omite creación).

.EXAMPLE
  .\scripts\setup-stripe-test.ps1 -ApiKey sk_test_xxxxxxxx
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$ApiKey,

    [string]$WebhookSecret = "",

    [string]$PriceStarter = "",

    [string]$PricePro = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"

if (-not $ApiKey.StartsWith("sk_test_")) {
    Write-Warning "La clave no empieza con sk_test_. Asegúrate de usar modo TEST."
}

function Stripe-Post($path, $body) {
    $uri = "https://api.stripe.com/v1$path"
    $headers = @{ Authorization = "Bearer $ApiKey" }
    return Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
}

function Stripe-Get($path) {
    $uri = "https://api.stripe.com/v1$path"
    $headers = @{ Authorization = "Bearer $ApiKey" }
    return Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
}

function Find-Or-Create-Price($productName, $amountCents, $existingPriceId) {
    if ($existingPriceId) {
        Write-Host "[OK] Usando price existente: $existingPriceId ($productName)" -ForegroundColor Green
        return $existingPriceId
    }

    $products = Stripe-Get "/products?active=true&limit=100"
    $product = $products.data | Where-Object { $_.name -eq $productName } | Select-Object -First 1

    if (-not $product) {
        Write-Host "Creando producto: $productName" -ForegroundColor Cyan
        $product = Stripe-Post "/products" @{
            name = $productName
            description = "Membresía StockFlow — $productName"
        }
    } else {
        Write-Host "Producto existente: $($product.id) ($productName)" -ForegroundColor DarkGray
    }

    $prices = Stripe-Get "/prices?product=$($product.id)&active=true&limit=100"
    $price = $prices.data | Where-Object {
        $_.unit_amount -eq $amountCents -and
        $_.currency -eq "usd" -and
        $_.recurring.interval -eq "month"
    } | Select-Object -First 1

    if (-not $price) {
        Write-Host "Creando precio mensual USD $($amountCents / 100) para $productName" -ForegroundColor Cyan
        $price = Stripe-Post "/prices" @{
            product = $product.id
            unit_amount = $amountCents
            currency = "usd"
            "recurring[interval]" = "month"
        }
    } else {
        Write-Host "Precio existente: $($price.id)" -ForegroundColor DarkGray
    }

    return $price.id
}

Write-Host "=== StockFlow — Stripe test setup ===" -ForegroundColor Cyan

$starterId = Find-Or-Create-Price "StockFlow Starter" 1900 $PriceStarter
$proId = Find-Or-Create-Price "StockFlow Pro" 3900 $PricePro

if (-not (Test-Path $envFile)) {
    throw "No se encontró $envFile"
}

$content = Get-Content $envFile -Raw

function Set-EnvVar([string]$text, [string]$key, [string]$value) {
    $line = "$key=$value"
    if ($text -match "(?m)^$key=.*$") {
        return [regex]::Replace($text, "(?m)^$key=.*$", $line)
    }
    return $text.TrimEnd() + "`n$line`n"
}

$content = Set-EnvVar $content "STRIPE_ENABLED" "true"
$content = Set-EnvVar $content "STRIPE_API_KEY" $ApiKey
$content = Set-EnvVar $content "STRIPE_PRICE_STARTER" $starterId
$content = Set-EnvVar $content "STRIPE_PRICE_PRO" $proId
$content = Set-EnvVar $content "STRIPE_SUCCESS_URL" "http://localhost:5176/membresia?success=1"
$content = Set-EnvVar $content "STRIPE_CANCEL_URL" "http://localhost:5176/membresia?cancel=1"

if ($WebhookSecret) {
    $content = Set-EnvVar $content "STRIPE_WEBHOOK_SECRET" $WebhookSecret
} elseif ($content -notmatch "(?m)^STRIPE_WEBHOOK_SECRET=") {
    $content = Set-EnvVar $content "STRIPE_WEBHOOK_SECRET" "whsec_PENDIENTE_stripe_listen"
}

Set-Content -Path $envFile -Value $content -NoNewline
Write-Host ""
Write-Host "Actualizado: $envFile" -ForegroundColor Green
Write-Host "  STRIPE_PRICE_STARTER = $starterId"
Write-Host "  STRIPE_PRICE_PRO     = $proId"
Write-Host ""

if (-not $WebhookSecret -or $WebhookSecret -like "*PENDIENTE*") {
    Write-Host "Siguiente paso — webhook local (otra terminal):" -ForegroundColor Yellow
    Write-Host "  stripe listen --forward-to localhost:8080/api/webhooks/stripe" -ForegroundColor White
    Write-Host "  Copia el whsec_... que imprime y actualiza STRIPE_WEBHOOK_SECRET en .env" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Reinicia el backend cargando .env:" -ForegroundColor Yellow
Write-Host @"
  cd projects/inventory-api
  Get-Content .env | ForEach-Object {
    if (`$_ -match '^\s*([^#][^=]+)=(.*)$') {
      [Environment]::SetEnvironmentVariable(`$matches[1].Trim(), `$matches[2].Trim(), 'Process')
    }
  }
  mvn spring-boot:run
"@ -ForegroundColor DarkGray

Write-Host ""
Write-Host "Prueba: login -> /membresia -> Suscribirse -> tarjeta 4242 4242 4242 4242" -ForegroundColor Cyan
