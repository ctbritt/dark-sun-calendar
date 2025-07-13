#!/bin/bash

# Simple script to simulate the GitHub Actions workflow locally
# This runs the same steps as the workflow without requiring Docker

echo "🚀 Running workflow simulation locally..."
echo ""

# Configuration
TEST_VERSION="2.1.0"
TEST_TAG="v$TEST_VERSION"
REPOSITORY="ctbritt/dark-sun-calendar"

# URLs for testing
PROJECT_URL="https://github.com/$REPOSITORY"
RELEASE_MANIFEST_URL="https://github.com/$REPOSITORY/releases/download/$TEST_TAG/module.json"
RELEASE_MODULE_URL="https://github.com/$REPOSITORY/releases/download/$TEST_TAG/module.zip"

echo "📋 Configuration:"
echo "  Version: $TEST_VERSION"
echo "  Tag: $TEST_TAG"
echo "  Project URL: $PROJECT_URL"
echo "  Manifest URL: $RELEASE_MANIFEST_URL"
echo "  Download URL: $RELEASE_MODULE_URL"
echo ""

# Step 1: Check if module.json exists and has tokens
echo "1️⃣ Checking module.json..."
if [ ! -f "module.json" ]; then
    echo "❌ module.json not found!"
    exit 1
fi

if grep -q '\${{ env.VERSION }}' module.json && \
   grep -q '\${{ env.URL }}' module.json && \
   grep -q '\${{ env.MANIFEST }}' module.json && \
   grep -q '\${{ env.DOWNLOAD }}' module.json; then
    echo "✅ module.json contains required tokens"
else
    echo "❌ module.json missing required tokens!"
    exit 1
fi

# Step 2: Create a backup of the original module.json
echo ""
echo "2️⃣ Creating backup of module.json..."
cp module.json module.json.backup

# Step 3: Replace tokens with actual values
echo ""
echo "3️⃣ Replacing tokens with actual values..."
sed -i "s/\${{ env.VERSION }}/$TEST_VERSION/g" module.json
sed -i "s|\${{ env.URL }}|$PROJECT_URL|g" module.json
sed -i "s|\${{ env.MANIFEST }}|$RELEASE_MANIFEST_URL|g" module.json
sed -i "s|\${{ env.DOWNLOAD }}|$RELEASE_MODULE_URL|g" module.json

echo "✅ Token replacement completed"

# Step 4: Validate JSON
echo ""
echo "4️⃣ Validating JSON..."
if python3 -m json.tool module.json > /dev/null 2>&1; then
    echo "✅ JSON is valid"
else
    echo "❌ Invalid JSON after token replacement!"
    cp module.json.backup module.json
    exit 1
fi

# Step 5: Check required files for zip
echo ""
echo "5️⃣ Checking files for zip creation..."
REQUIRED_FILES=("module.json" "README.md" "historical_events.json" "LICENSE" "macro-example.js")
REQUIRED_DIRS=("templates" "calendar" "scripts" "styles" "lang")

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        MISSING_FILES+=("$dir")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ All required files exist"
else
    echo "❌ Missing files: ${MISSING_FILES[*]}"
    cp module.json.backup module.json
    exit 1
fi

# Step 6: Create zip file
echo ""
echo "6️⃣ Creating module.zip..."
zip -r module.zip module.json README.md historical_events.json LICENSE macro-example.js templates/ calendar/ scripts/ styles/ lang/

if [ -f "module.zip" ]; then
    ZIP_SIZE=$(du -h module.zip | cut -f1)
    echo "✅ module.zip created ($ZIP_SIZE)"
else
    echo "❌ Failed to create module.zip"
    cp module.json.backup module.json
    exit 1
fi

# Step 7: Show results
echo ""
echo "7️⃣ Results:"
echo "📄 Updated module.json:"
echo "   $(head -n 1 module.json | cut -c1-50)..."
echo ""
echo "📦 module.zip:"
echo "   Size: $ZIP_SIZE"
echo "   Contents:"
unzip -l module.zip | head -10

echo ""
echo "🎉 Workflow simulation completed successfully!"
echo ""
echo "📁 Generated files:"
echo "   - module.json (updated with version $TEST_VERSION)"
echo "   - module.zip ($ZIP_SIZE)"
echo ""
echo "🧹 To restore original module.json:"
echo "   cp module.json.backup module.json"
echo ""
echo "🗑️  To clean up:"
echo "   rm module.zip module.json.backup" 