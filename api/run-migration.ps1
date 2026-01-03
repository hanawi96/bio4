# Run migration on remote D1 database
# Usage: .\run-migration.ps1 [migration-file]

param(
    [string]$MigrationFile = "migrations/025_cleanup_existing_themes.sql"
)

$DatabaseId = "4932ed51-7d36-4999-a8fe-b7cb14531959"

Write-Host "🚀 Running migration: $MigrationFile" -ForegroundColor Cyan
Write-Host "📦 Database ID: $DatabaseId" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
$wranglerExists = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wranglerExists) {
    Write-Host "❌ Error: wrangler CLI not found" -ForegroundColor Red
    Write-Host "Install it with: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Check if migration file exists
if (-not (Test-Path $MigrationFile)) {
    Write-Host "❌ Error: Migration file not found: $MigrationFile" -ForegroundColor Red
    exit 1
}

# Run migration
Write-Host "⏳ Executing migration..." -ForegroundColor Yellow
wrangler d1 execute bio-link-db --remote --file="$MigrationFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Verify results with:" -ForegroundColor Cyan
    Write-Host 'wrangler d1 execute bio-link-db --remote --command="SELECT key, json_extract(config, ''$.background.type'') as bg_type FROM theme_presets;"' -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
