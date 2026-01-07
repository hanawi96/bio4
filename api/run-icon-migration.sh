#!/bin/bash
# Bash script to run icon fields migration
# Usage: ./run-icon-migration.sh

echo "Running icon fields migration..."

# Read the SQL file
SQL_CONTENT=$(cat migrations/add_icon_fields.sql)

# Execute migration using wrangler d1 execute
npx wrangler d1 execute bio-link-db --local --command="$SQL_CONTENT"

if [ $? -eq 0 ]; then
    echo "✓ Migration completed successfully!"
else
    echo "✗ Migration failed!"
    exit 1
fi
