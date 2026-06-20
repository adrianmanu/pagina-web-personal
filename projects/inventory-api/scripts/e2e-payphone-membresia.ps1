$ErrorActionPreference = "Stop"
$base = "http://localhost:8080"
$email = "payphone-test@stockflow.dev"
$pass = "test1234"
$results = @()

function Step($name, $scriptBlock) {
  try {
    $r = & $scriptBlock
    Write-Host "[OK] $name" -ForegroundColor Green
    $script:results += "OK  $name"
    return $r
  } catch {
    $msg = $_.Exception.Message
    if ($_.ErrorDetails.Message) { $msg = $_.ErrorDetails.Message }
    Write-Host "[FAIL] $name :: $msg" -ForegroundColor Red
    $script:results += "FAIL $name :: $msg"
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

Write-Host "=== E2E PayPhone Membresia ===" -ForegroundColor Cyan

Step "Health" { Invoke-RestMethod "$base/health" }

$auth = $null
try {
  $auth = Api POST "/api/auth/login" @{ email = $email; password = $pass } $null
} catch {
  Api POST "/api/auth/register" @{ email = $email; password = $pass; fullName = "PayPhone QA" } $null | Out-Null
  $auth = Api POST "/api/auth/login" @{ email = $email; password = $pass } $null
}
$token = $auth.accessToken

$provider = Step "Billing provider" { Api GET "/api/membership/billing-provider" $null $token }
if ($provider.provider -ne "payphone" -or -not $provider.paymentsEnabled) {
  throw "PayPhone no habilitado: $($provider | ConvertTo-Json -Compress)"
}

Step "Membership status" { Api GET "/api/membership/status" $null $token }
Step "Membership plans" { Api GET "/api/membership/plans" $null $token }

$checkout = Step "Checkout STARTER" { Api POST "/api/membership/checkout" @{ plan = "STARTER" } $token }
if ($checkout.provider -ne "payphone") { throw "Checkout provider esperado payphone, got $($checkout.provider)" }
if (-not $checkout.checkoutUrl) { throw "Sin checkoutUrl de PayPhone" }
Write-Host "  PayPhone URL: $($checkout.checkoutUrl.Substring(0, [Math]::Min(80, $checkout.checkoutUrl.Length)))..." -ForegroundColor DarkGray

Write-Host ""
Write-Host "=== Resumen ===" -ForegroundColor Cyan
$results | ForEach-Object { Write-Host $_ }
