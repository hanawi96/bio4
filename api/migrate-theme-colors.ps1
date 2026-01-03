#!/usr/bin/env pwsh
# Migrate theme colors in remote database
# Usage: .\migrate-theme-colors.ps1

Write-Host "🚀 Theme Color Migration" -ForegroundColor Cyan
Write-Host ""

# Check if in api directory
if (-not (Test-Path "wrangler.toml")) {
    Write-Host "❌ Error: Must run from api directory" -ForegroundColor Red
    Write-Host "   cd api" -ForegroundColor Yellow
    Write-Host "   .\migrate-theme-colors.ps1" -ForegroundColor Yellow
    exit 1
}

# Confirm migration
Write-Host "⚠️  This will update ALL themes in the remote database" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (y/N)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""

# Run migration
try {
    node migrate-theme-colors.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host ""
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    exit 1
}
