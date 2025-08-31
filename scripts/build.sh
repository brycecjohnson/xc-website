#!/bin/bash

# Build script for preparing the site
echo "🔨 Building site..."

# Create a dist directory if needed for any build process
if [ ! -d "dist" ]; then
    mkdir dist
fi

# Copy all files to dist (if using a build process)
# For now, we're serving files directly from root

echo "✅ Build complete!"
echo "📁 Files ready for deployment"

# List all HTML files
echo ""
echo "📄 HTML files:"
find . -name "*.html" -not -path "./dist/*" -not -path "./.git/*" | sed 's|^./||'