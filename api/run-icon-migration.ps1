# PowerShell script to run icon fields migration
# Usage: .\run-icon-migration.ps1

Write-Host "Running icon fields migration..." -ForegroundColor Cyan

# Read the SQL file
$sqlContent = Get-Content -Path "migrations/add_icon_fields.sql" -Raw

# Execute migration using wrangler d1 execute
npx wrangler d1 execute bio-link-db --local --command="$sqlContent"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Migration failed!" -ForegroundColor Red
    exit 1
}
