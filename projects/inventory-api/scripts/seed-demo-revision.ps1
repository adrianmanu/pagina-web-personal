# Carga datos de prueba + flujo SRI completo para revision manual de la UI
$ErrorActionPreference = "Stop"
$base = "http://localhost:8080"
$email = "demo@stockflow.dev"
$pass = "demo1234"

function Step($name, $scriptBlock) {
  try {
    $result = & $scriptBlock
    Write-Host "[OK] $name" -ForegroundColor Green
    return $result
  } catch {
    $msg = $_.Exception.Message
    if ($_.ErrorDetails.Message) { $msg = $_.ErrorDetails.Message }
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

# Evita que @() o filtros unifiquen varios registros en un solo objeto (bug PowerShell + REST).
function As-List($value) {
  if ($null -eq $value) { return @() }
  if ($value -is [System.Array]) { return $value }
  return @($value)
}

function Find-ByTaxId($items, $taxId) {
  foreach ($item in (As-List $items)) {
    if ($item.taxId -eq $taxId) { return $item }
  }
  return $null
}

function Find-BySku($items, $sku) {
  foreach ($item in (As-List $items)) {
    if ($item.sku -eq $sku) { return $item }
  }
  return $null
}

function Poll-Sri($label, $refreshPath, $token, $doc, $max = 60) {
  for ($i = 0; $i -lt $max -and $doc.sriStatus -ne "AUTORIZADO"; $i++) {
    Start-Sleep -Seconds 4
    $doc = Api POST $refreshPath $null $token
    Write-Host "[INFO] SRI $label intento $($i+1): $($doc.sriStatus)" -ForegroundColor Yellow
  }
  if ($doc.sriStatus -ne "AUTORIZADO") {
    throw "$label no autorizado: $($doc.sriStatus) $($doc.sriErrorMessage)"
  }
  return $doc
}

Write-Host "=== StockFlow - Carga datos de prueba ===" -ForegroundColor Cyan
Step "Health backend" { Invoke-RestMethod "$base/health" }
Start-Sleep -Seconds 4

$auth = $null
for ($attempt = 1; $attempt -le 5; $attempt++) {
  try {
    $auth = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
    Write-Host "[OK] Login usuario demo" -ForegroundColor Green
    break
  } catch {
    if ($attempt -eq 5) {
      try {
        Api POST "/api/auth/register" @{ email = $email; password = $pass; fullName = "Usuario Demo Revision" } $null | Out-Null
      } catch {}
      $auth = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
      Write-Host "[OK] Registro + login demo" -ForegroundColor Green
    } else {
      Start-Sleep -Seconds 3
    }
  }
}
$token = $auth.accessToken

Step "Perfil negocio" {
  Api PUT "/api/settings/business" @{
    businessName = "Cafeteria Demo StockFlow"
    ruc = "1713581054001"
    razonSocial = "ACOSTA ARIAS ANA DEL ROCIO"
    direccion = "B-O Nro 15 y Calle C-OE7, Quito"
    emailNotificaciones = $email
  } $token
}

try {
  Step "Punto emision" {
    Api POST "/api/settings/emission-points" @{
      establishmentCode = "001"
      emissionPointCode = "002"
      label = "Principal Demo"
      address = "Quito, Ecuador"
      defaultPoint = $true
    } $token
  }
} catch {
  Write-Host "[INFO] Punto emision ya configurado" -ForegroundColor Yellow
}

Step "Completar onboarding" { Api POST "/api/settings/onboarding/complete" $null $token }

@(
  @{ name = "Cafe Americano"; sku = "CAF-001"; stock = 100; price = 2.50; category = "Bebidas" },
  @{ name = "Sandwich mixto"; sku = "COM-010"; stock = 40; price = 4.75; category = "Comida" },
  @{ name = "Servicio consultoria"; sku = "SRV-100"; stock = 999; price = 25.00; category = "Servicios" }
) | ForEach-Object {
  $def = $_
  $existing = Find-BySku (Api GET "/api/products" $null $token) $def.sku
  if ($existing) {
    Write-Host "[OK] Producto $($def.sku) (reutilizar)" -ForegroundColor Green
  } else {
    Step "Producto $($def.sku)" { Api POST "/api/products" $def $token }
  }
}

$customer = Find-ByTaxId (Api GET "/api/customers" $null $token) "1791234567001"
if (-not $customer) {
  $customer = Step "Cliente consumidor" {
    Api POST "/api/customers" @{
      name = "Distribuidora Norte Cia. Ltda."
      taxId = "1791234567001"
      email = "ventas@norte-demo.com"
      address = "Av. Amazonas, Quito"
      phone = "022345678"
    } $token
  }
} else {
  Write-Host "[OK] Cliente $($customer.name) (reutilizar)" -ForegroundColor Green
}

if (-not (Find-ByTaxId (Api GET "/api/customers" $null $token) "1713581054001")) {
  Step "Cliente final pruebas" {
    Api POST "/api/customers" @{
      name = "Cliente Pruebas SRI"
      taxId = "1713581054001"
      email = "cliente-demo@correo.com"
      address = "Quito"
    } $token
  }
} else {
  Write-Host "[OK] Cliente pruebas SRI (reutilizar)" -ForegroundColor Green
}

$supplierSri = Find-ByTaxId (Api GET "/api/suppliers" $null $token) "0910000000001"
if (-not $supplierSri) {
  $supplierSri = Step "Proveedor SRI pruebas" {
    Api POST "/api/suppliers" @{
      name = "Proveedor Pruebas SRI"
      taxId = "0910000000001"
      email = "prov-sri@correo.com"
      address = "Guayaquil"
    } $token
  }
} else {
  Write-Host "[OK] Proveedor SRI (reutilizar)" -ForegroundColor Green
}

if (-not (Find-ByTaxId (Api GET "/api/suppliers" $null $token) "0998765432001")) {
  Step "Proveedor local" {
    Api POST "/api/suppliers" @{
      name = "Insumos Andinos S.A."
      taxId = "0998765432001"
      email = "compras@andinos.com"
      address = "Cuenca"
    } $token
  }
} else {
  Write-Host "[OK] Proveedor local (reutilizar)" -ForegroundColor Green
}

$product = Find-BySku (Api GET "/api/products" $null $token) "CAF-001"
$product2 = Find-BySku (Api GET "/api/products" $null $token) "COM-010"
if (-not $product -or -not $product2) { throw "Productos demo no encontrados" }

$invoice = Step "Factura electronica" {
  Api POST "/api/invoices" @{
    finalConsumer = $false
    customerId = [int64]$customer.id
    customerName = $customer.name
    customerTaxId = $customer.taxId
    customerEmail = $customer.email
    customerAddress = $customer.address
    items = @(
      @{ productId = [int64]$product.id; quantity = 3 },
      @{ productId = [int64]$product2.id; quantity = 2 }
    )
  } $token
}
$invoice = Poll-Sri "factura" "/api/invoices/$($invoice.id)/sri/refresh" $token $invoice

$cn = Step "Nota de credito" {
  Api POST "/api/credit-notes" @{
    invoiceId = $invoice.id
    motivo = "Devolucion demo revision"
    restockStock = $true
    fullCredit = $true
  } $token
}
$cn = Poll-Sri "NC" "/api/credit-notes/$($cn.id)/sri/refresh" $token $cn

$xml251 = @'
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

$received = Step "Importar XML recibido 251" {
  try {
    Api POST "/api/received-documents/upload" @{ xml = $xml251; sustentoCode = "01" } $token
  } catch {
    $docs = Api GET "/api/received-documents" $null $token
    $docs | Where-Object documentNumber -eq "011-007-000000251" | Select-Object -First 1
  }
}

$taxableBase = if ($received.subtotal) { [double]$received.subtotal } else { 4226.40 }
$retention = Step "Retencion renta 1 porciento" {
  Api POST "/api/retentions" @{
    supplierId = [int64]$supplierSri.id
    receivedDocumentId = [int64]$received.id
    items = @(@{ retentionCodeId = "renta-1-servicios"; taxableBase = $taxableBase })
  } $token
}
$retention = Poll-Sri "retencion" "/api/retentions/$($retention.id)/sri/refresh" $token $retention

$year = 2026
$month = 6
$atsPath = "/api/ats/preview?year=$year" + '&' + "month=$month"
$preview = Step "ATS preview" { Api GET $atsPath $null $token }

$frontend = "http://localhost:5176"
try {
  $null = Invoke-WebRequest -Uri $frontend -TimeoutSec 2 -UseBasicParsing
} catch {
  $frontend = "http://localhost:5173"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DATOS DE PRUEBA LISTOS PARA REVISAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL:      $frontend"
Write-Host "Usuario:  $email"
Write-Host "Password: $pass"
Write-Host ""
Write-Host "Factura:     $($invoice.sriDocumentNumber) $($invoice.sriStatus)"
Write-Host "NC:          $($cn.sriDocumentNumber) $($cn.sriStatus)"
Write-Host "Doc recibido: $($received.documentNumber)"
Write-Host "Retencion:   $($retention.sriDocumentNumber) $($retention.sriStatus)"
Write-Host "ATS $month/$year ready: $($preview.readyToExport)"
Write-Host ""
Write-Host "Onboarding completado. Entra directo al panel." -ForegroundColor Green
