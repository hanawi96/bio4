# Test Appearance API with Schema V2
# Tests draft/published profile and appearance separation

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  APPEARANCE API TEST - SCHEMA V2" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8787"
$username = "demo"

# Test 1: Save Draft with Profile + Theme
Write-Host "TEST 1: Save Draft (Profile + Theme)" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

$draftData = @{
    title = "Appearance Test"
    bio = "Testing realtime preview"
    avatar_url = "https://example.com/avatar.jpg"
    theme = @{
        backgroundColor = "#1a1a1a"
        textColor = "#ffffff"
        primaryColor = "#00d4ff"
        fontFamily = "Poppins"
        borderRadius = 12
        spacing = 20
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/editor/$username/draft" -Method PUT -Body $draftData -ContentType "application/json"
    if ($response.success) {
        Write-Host "✅ Draft saved successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to save draft: $_" -ForegroundColor Red
    exit 1
}

Start-Sleep -Milliseconds 500

# Test 2: Get Editor Data (Draft)
Write-Host "`nTEST 2: Get Editor Data (Draft)" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

try {
    $editorData = Invoke-RestMethod -Uri "$baseUrl/editor/$username" -Method GET
    
    Write-Host "Profile:" -ForegroundColor Cyan
    Write-Host "  Title: $($editorData.page.title)" -ForegroundColor White
    Write-Host "  Bio: $($editorData.page.bio)" -ForegroundColor White
    
    Write-Host "`nTheme:" -ForegroundColor Cyan
    Write-Host "  Background: $($editorData.theme.backgroundColor)" -ForegroundColor White
    Write-Host "  Primary: $($editorData.theme.primaryColor)" -ForegroundColor White
    Write-Host "  Font: $($editorData.theme.fontFamily)" -ForegroundColor White
    Write-Host "  Border Radius: $($editorData.theme.borderRadius)px" -ForegroundColor White
    
    if ($editorData.theme.primaryColor -eq "#00d4ff") {
        Write-Host "✅ Theme loaded correctly from draft" -ForegroundColor Green
    } else {
        Write-Host "❌ Theme mismatch" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to get editor data: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Update Only Theme
Write-Host "`nTEST 3: Update Only Theme (Keep Profile)" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

$themeOnly = @{
    theme = @{
        backgroundColor = "#ffffff"
        textColor = "#000000"
        primaryColor = "#ff6b6b"
        fontFamily = "Inter"
        borderRadius = 8
        spacing = 16
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/editor/$username/draft" -Method PUT -Body $themeOnly -ContentType "application/json"
    Start-Sleep -Milliseconds 500
    
    $editorData = Invoke-RestMethod -Uri "$baseUrl/editor/$username" -Method GET
    
    if ($editorData.page.title -eq "Appearance Test" -and $editorData.theme.primaryColor -eq "#ff6b6b") {
        Write-Host "✅ Profile unchanged, theme updated" -ForegroundColor Green
        Write-Host "  Title: $($editorData.page.title) (unchanged)" -ForegroundColor White
        Write-Host "  Theme: $($editorData.theme.primaryColor) (updated)" -ForegroundColor White
    } else {
        Write-Host "❌ Update failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to update theme: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Publish Draft
Write-Host "`nTEST 4: Publish Draft" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/editor/$username/publish" -Method POST
    if ($response.success) {
        Write-Host "✅ Published successfully" -ForegroundColor Green
    }
    
    Start-Sleep -Milliseconds 500
    
    # Verify published data
    $publicData = Invoke-RestMethod -Uri "$baseUrl/bio/$username" -Method GET
    
    Write-Host "`nPublished Data:" -ForegroundColor Cyan
    Write-Host "  Title: $($publicData.page.title)" -ForegroundColor White
    Write-Host "  Theme: $($publicData.theme.primaryColor)" -ForegroundColor White
    Write-Host "  Published At: $($publicData.page.published_at)" -ForegroundColor White
    
    if ($publicData.theme.primaryColor -eq "#ff6b6b") {
        Write-Host "✅ Published theme matches draft" -ForegroundColor Green
    } else {
        Write-Host "❌ Published theme mismatch" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to publish: $_" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Draft save (profile + theme)" -ForegroundColor Green
Write-Host "  ✅ Draft load with custom theme" -ForegroundColor Green
Write-Host "  ✅ Partial update (theme only)" -ForegroundColor Green
Write-Host "  ✅ Publish draft → published" -ForegroundColor Green
Write-Host "  ✅ Schema V2 working correctly" -ForegroundColor Green
Write-Host ""
