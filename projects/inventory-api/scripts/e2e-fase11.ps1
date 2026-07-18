$ErrorActionPreference = "Stop"
$base = "http://localhost:8080"
$email = "fase11@stockflow.dev"
$pass = "test1234"
$suffix = Get-Date -Format "yyyyMMddHHmmss"
$log = @()

function Step($name, $scriptBlock) {
  try {
    $result = & $scriptBlock
    $log += "OK  $name"
    Write-Host "[OK] $name" -ForegroundColor Green
    return $result
  } catch {
    $msg = $_.Exception.Message
    if ($_.ErrorDetails.Message) { $msg = $_.ErrorDetails.Message }
    $log += "FAIL $name :: $msg"
    Write-Host "[FAIL] $name :: $msg" -ForegroundColor Red
    throw
  }
}

function Api($method, $path, $body, $token) {
  $params = @{ Method = $method; Uri = "$base$path" }
  if ($token) { $params.Headers = @{ Authorization = "Bearer $token" } }
  if ($body) {
    $params.ContentType = "application/json"
    $params.Body = ($body | ConvertTo-Json -Depth 10)
  }
  return Invoke-RestMethod @params
}

Write-Host "=== E2E Fase 11 StockFlow ===" -ForegroundColor Cyan

Step "Health" { Invoke-RestMethod "$base/health" }
Start-Sleep -Seconds 5

$auth = $null
for ($attempt = 1; $attempt -le 5; $attempt++) {
  try {
    $auth = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
    Write-Host "[OK] Login" -ForegroundColor Green
    break
  } catch {
    if ($attempt -eq 5) {
      try {
        Api POST "/api/auth/register" @{ email = $email; password = $pass; fullName = "Fase 11 QA" } $null | Out-Null
      } catch {}
      $auth = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
      Write-Host "[OK] Register+Login" -ForegroundColor Green
    } else {
      Write-Host "[INFO] Login intento $attempt, reintentando..." -ForegroundColor Yellow
      Start-Sleep -Seconds 3
    }
  }
}
if (-not $auth) { throw "No se pudo autenticar" }
$token = $auth.accessToken

Step "Onboarding perfil" {
  Api PUT "/api/settings/business" @{
    businessName = "StockFlow Fase 11"
    ruc = "1713581054001"
    razonSocial = "ACOSTA ARIAS ANA DEL ROCIO"
    direccion = "Quito"
    emailNotificaciones = "fase11@stockflow.dev"
  } $token
}

try {
  Step "Punto emision" {
    Api POST "/api/settings/emission-points" @{
      establishmentCode = "001"
      emissionPointCode = "002"
      label = "Principal F11"
      defaultPoint = $true
    } $token
  }
} catch {
  Write-Host "[INFO] Punto emision ya existe" -ForegroundColor Yellow
}

Step "Completar onboarding" { Api POST "/api/settings/onboarding/complete" $null $token }

$products = Api GET "/api/products" $null $token
$product = $products | Where-Object { $_.sku -like "F11-*" } | Select-Object -First 1
if (-not $product) {
  $product = Step "Crear producto" {
    Api POST "/api/products" @{
      name = "Producto Fase 11"
      sku = "F11-$suffix"
      stock = 50
      price = 10
      category = "Pruebas"
    } $token
  }
} else {
  Write-Host "[OK] Reutilizar producto $($product.sku)" -ForegroundColor Green
}

$customers = Api GET "/api/customers" $null $token
$customer = $customers | Where-Object { $_.taxId -eq "1713581054001" } | Select-Object -First 1
if (-not $customer) {
  $customer = Step "Crear cliente" {
    Api POST "/api/customers" @{
      name = "Cliente Fase 11 S.A."
      taxId = "1713581054001"
      email = "cliente-f11@correo.com"
      address = "Quito"
    } $token
  }
} else {
  Write-Host "[OK] Reutilizar cliente $($customer.name)" -ForegroundColor Green
}

$suppliers = Api GET "/api/suppliers" $null $token
$supplier = $suppliers | Where-Object { $_.taxId -eq "0910000000001" } | Select-Object -First 1
if (-not $supplier) {
  $supplier = Step "Crear proveedor" {
    Api POST "/api/suppliers" @{
      name = "Proveedor Pruebas SRI"
      taxId = "0910000000001"
      email = "prov@correo.com"
    } $token
  }
} else {
  Write-Host "[OK] Reutilizar proveedor $($supplier.name)" -ForegroundColor Green
}

$invoice = Step "Emitir factura" {
  Api POST "/api/invoices" @{
    finalConsumer = $false
    customerId = $customer.id
    customerName = $customer.name
    customerTaxId = $customer.taxId
    customerEmail = $customer.email
    customerAddress = $customer.address
    items = @(@{ productId = $product.id; quantity = 2 })
  } $token
}

for ($i = 0; $i -lt 30 -and $invoice.sriStatus -ne "AUTORIZADO"; $i++) {
  Start-Sleep -Seconds 3
  $invoice = Api POST "/api/invoices/$($invoice.id)/sri/refresh" $null $token
  Write-Host "[INFO] SRI factura intento $($i+1): $($invoice.sriStatus)" -ForegroundColor Yellow
}

if ($invoice.sriStatus -ne "AUTORIZADO") {
  throw "Factura no autorizada: $($invoice.sriStatus) $($invoice.sriErrorMessage)"
}
Write-Host "[OK] Factura autorizada $($invoice.sriDocumentNumber)" -ForegroundColor Green

$cn = Step "Nota de credito" {
  Api POST "/api/credit-notes" @{
    invoiceId = $invoice.id
    motivo = "Devolucion Fase 11"
    restockStock = $true
    fullCredit = $true
  } $token
}
for ($i = 0; $i -lt 30 -and $cn.sriStatus -ne "AUTORIZADO"; $i++) {
  Start-Sleep -Seconds 3
  $cn = Api POST "/api/credit-notes/$($cn.id)/sri/refresh" $null $token
  Write-Host "[INFO] SRI NC intento $($i+1): $($cn.sriStatus)" -ForegroundColor Yellow
}
if ($cn.sriStatus -ne "AUTORIZADO") {
  throw "NC no autorizada: $($cn.sriStatus) $($cn.sriErrorMessage)"
}

# XML de prueba SRI/Datil (011-007-000000251). Documentos inventados no autorizan en ambiente pruebas.
$xml = @'
<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <razonSocial>PROVEEDOR PRUEBAS SRI</razonSocial>
    <ruc>0910000000001</ruc>
    <codDoc>01</codDoc>
    <estab>011</estab>
    <ptoEmi>007</ptoEmi>
    <secuencial>000000251</secuencial>
    <claveAcceso>0412201501091000000001701100700000025112345678123</claveAcceso>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>04/12/2015</fechaEmision>
    <totalSinImpuestos>4226.40</totalSinImpuestos>
    <importeTotal>4226.40</importeTotal>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <valor>0.00</valor>
      </totalImpuesto>
    </totalConImpuestos>
  </infoFactura>
</factura>
'@

$received = Step "Importar XML recibido" {
  try {
    Api POST "/api/received-documents/upload" @{ xml = $xml; sustentoCode = "01" } $token
  } catch {
    $docs = Api GET "/api/received-documents" $null $token
    $existing = $docs | Where-Object { $_.documentNumber -eq "011-007-000000251" } | Select-Object -First 1
    if (-not $existing) { throw }
    Write-Host "[INFO] Reutilizar documento $($existing.documentNumber)" -ForegroundColor Yellow
    $existing
  }
}

$taxableBase = if ($received.subtotal) { [double]$received.subtotal } else { 1000 }
$retention = Step "Emitir retencion" {
  Api POST "/api/retentions" @{
    supplierId = $supplier.id
    receivedDocumentId = $received.id
    items = @(@{ retentionCodeId = "renta-1-servicios"; taxableBase = $taxableBase })
  } $token
}
for ($i = 0; $i -lt 30 -and $retention.sriStatus -ne "AUTORIZADO" -and $retention.sriStatus -ne "NO AUTORIZADO"; $i++) {
  Start-Sleep -Seconds 3
  $retention = Api POST "/api/retentions/$($retention.id)/sri/refresh" $null $token
  Write-Host "[INFO] SRI retencion intento $($i+1): $($retention.sriStatus)" -ForegroundColor Yellow
}
if ($retention.sriStatus -ne "AUTORIZADO") {
  throw "Retencion no autorizada: $($retention.sriStatus) $($retention.sriErrorMessage)"
}
Write-Host "[OK] Retencion autorizada $($retention.sriDocumentNumber)" -ForegroundColor Green

$year = 2026
$month = 6
$preview = Step "ATS preview $month/$year" { Api GET "/api/ats/preview?year=$year&month=$month" $null $token }
if (-not $preview.readyToExport) {
  $errs = ($preview.validations | Where-Object { $_.level -eq "ERROR" }).message -join "; "
  throw "ATS no listo para exportar: $errs"
}

$zipPath = Join-Path $env:TEMP "AT062026-fase11.zip"
Step "ATS export ZIP" {
  curl.exe -sS -f -H "Authorization: Bearer $token" -o $zipPath "$base/api/ats/export?year=$year&month=$month"
  if (-not (Test-Path $zipPath)) { throw "ZIP no generado" }
  $size = (Get-Item $zipPath).Length
  if ($size -lt 100) { throw "ZIP demasiado pequeño ($size bytes)" }
  "ZIP $zipPath ($size bytes)"
}

Write-Host ""
Write-Host "=== RESUMEN FASE 11 E2E ===" -ForegroundColor Cyan
Write-Host "Usuario: $email / $pass"
Write-Host "Factura: $($invoice.sriDocumentNumber) $($invoice.sriStatus)"
Write-Host "NC: $($cn.sriDocumentNumber) $($cn.sriStatus)"
Write-Host "Doc recibido: $($received.documentNumber)"
Write-Host "Retencion: $($retention.sriDocumentNumber) $($retention.sriStatus) OK"
Write-Host "ATS: $($preview.exportFileName) ready=$($preview.readyToExport)"
$log | ForEach-Object { Write-Host $_ }
