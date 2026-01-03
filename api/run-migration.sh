#!/bin/bash

# Run migration on remote D1 database
# Usage: ./run-migration.sh [migration-file]

MIGRATION_FILE=${1:-"migrations/025_cleanup_existing_themes.sql"}
DATABASE_ID="4932ed51-7d36-4999-a8fe-b7cb14531959"

echo "🚀 Running migration: $MIGRATION_FILE"
echo "📦 Database ID: $DATABASE_ID"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Run migration
echo "⏳ Executing migration..."
wrangler d1 execute bio-link-db --remote --file="$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🔍 Verify results with:"
    echo "wrangler d1 execute bio-link-db --remote --command=\"SELECT key, json_extract(config, '\$.background.type') as bg_type FROM theme_presets;\""
else
    echo ""
    echo "❌ Migration failed!"
    exit 1
fi
