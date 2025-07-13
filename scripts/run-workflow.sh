#!/bin/bash

# Script to run the GitHub Actions workflow locally using act
# This simulates creating a release and running the workflow

echo "🚀 Running GitHub Actions workflow locally..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get the current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

# Create a test tag if it doesn't exist
TEST_TAG="v2.1.0-test"
if ! git rev-parse "$TEST_TAG" > /dev/null 2>&1; then
    echo "🏷️  Creating test tag: $TEST_TAG"
    git tag "$TEST_TAG"
fi

echo ""
echo "🔧 Running workflow with act..."
echo "   This will simulate creating a release with tag: $TEST_TAG"
echo ""

# Run the workflow using act
# We use the release event and provide the tag name
./bin/act release \
    --eventpath <(cat <<EOF
{
  "action": "published",
  "release": {
    "tag_name": "$TEST_TAG",
    "name": "Test Release $TEST_TAG",
    "body": "This is a test release for local workflow testing",
    "draft": false,
    "prerelease": false
  }
}
EOF
) \
    --artifact-server-path ./artifacts \
    --container-architecture linux/amd64

echo ""
echo "✅ Workflow completed!"
echo ""
echo "📁 Check the artifacts directory for generated files:"
echo "   ls -la artifacts/"
echo ""
echo "🧹 To clean up the test tag:"
echo "   git tag -d $TEST_TAG" 