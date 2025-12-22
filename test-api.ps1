# Test Autosave & Publish API
# Usage: .\test-api.ps1 [local|remote]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('local', 'remote')]
    [string]$Environment = 'local'
)

$baseUrl = if ($Environment -eq 'remote') {
    'https://bio-link-api.yendev96.workers.dev'
} else {
    'http://localhost:8787'
}

Write-Host "🧪 Testing API: $baseUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: Save Draft
Write-Host "1️⃣  Testing PUT /editor/demo/draft..." -ForegroundColor Yellow
$draftBody = @{
    title = "Test Draft $(Get-Date -Format 'HH:mm:ss')"
    bio = "Testing autosave on $Environment"
    theme_mode = 'light'
    settings = @{
        testKey = "testValue"
        timestamp = (Get-Date).ToString()
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/editor/demo/draft" -Method PUT -Body $draftBody -ContentType 'application/json'
    Write-Host "✅ Draft saved: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Get Editor Data
Write-Host "2️⃣  Testing GET /editor/demo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/editor/demo" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Data retrieved:" -ForegroundColor Green
    Write-Host "   Username: $($data.page.username)"
    Write-Host "   Status: $($data.page.status)"
    Write-Host "   Draft Settings: $($data.page.draft_settings.Substring(0, [Math]::Min(50, $data.page.draft_settings.Length)))..."
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Publish
Write-Host "3️⃣  Testing POST /editor/demo/publish..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/editor/demo/publish" -Method POST -ContentType 'application/json'
    Write-Host "✅ Published: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Verify Published Data
Write-Host "4️⃣  Verifying published data..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/editor/demo" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Verification complete:" -ForegroundColor Green
    Write-Host "   Status: $($data.page.status)"
    Write-Host "   Settings: $($data.page.settings.Substring(0, [Math]::Min(50, $data.page.settings.Length)))..."
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 All tests passed on $Environment environment!" -ForegroundColor Green
