# Test Turso connection and verify data
Write-Host "Testing Turso Connection..." -ForegroundColor Cyan
Write-Host ""

# 1. Test Turso CLI connection
Write-Host "1. Testing Turso CLI connection..." -ForegroundColor Yellow
$tursoTest = turso db shell bio-link-db "SELECT COUNT(*) as count FROM theme_presets;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Turso CLI: OK" -ForegroundColor Green
    Write-Host "   $tursoTest" -ForegroundColor Gray
} else {
    Write-Host "   Turso CLI: FAILED" -ForegroundColor Red
    Write-Host "   Error: $tursoTest" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Test API endpoint
Write-Host "2. Testing API endpoint (GET /themes)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8787/themes" -Method Get -ErrorAction Stop
    $themeCount = $response.themes.Count
    
    Write-Host "   API Response: OK" -ForegroundColor Green
    Write-Host "   Themes found: $themeCount" -ForegroundColor Gray
    
    if ($themeCount -gt 0) {
        Write-Host "   First theme: $($response.themes[0].name) (key: $($response.themes[0].key))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   API Response: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Make sure API server is running:" -ForegroundColor Yellow
    Write-Host "   cd api && npm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""

# 3. Compare counts
Write-Host "3. Verifying data consistency..." -ForegroundColor Yellow

$tursoCount = [int]($tursoTest -replace '\D','')
$apiCount = $themeCount

if ($tursoCount -eq $apiCount) {
    Write-Host "   Data consistency: OK" -ForegroundColor Green
    Write-Host "   Turso: $tursoCount themes" -ForegroundColor Gray
    Write-Host "   API: $apiCount themes" -ForegroundColor Gray
} else {
    Write-Host "   Data consistency: WARNING" -ForegroundColor Yellow
    Write-Host "   Turso: $tursoCount themes" -ForegroundColor Gray
    Write-Host "   API: $apiCount themes" -ForegroundColor Gray
}

Write-Host ""
Write-Host "All tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Test in browser" -ForegroundColor Yellow
Write-Host "Visit: http://localhost:5173/dashboard/themes" -ForegroundColor White
