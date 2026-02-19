#!/bin/bash
# TinyFish Automation Wrapper for Big Homes

# Usage:
#   ./tinyfish.sh "url" "goal"
#
# Example:
#   ./tinyfish.sh "https://www.google.com/maps/search/plumbers+in+new+york" "Find 5 plumbers without websites"

TINYFISH_API_KEY="${TINYFISH_API_KEY:-}"
URL="$1"
GOAL="$2"

if [ -z "$TINYFISH_API_KEY" ]; then
    echo "❌ Set TINYFISH_API_KEY first"
    exit 1
fi

if [ -z "$URL" ] || [ -z "$GOAL" ]; then
    echo "Usage: $0 <url> <goal>"
    exit 1
fi

echo "🔍 Running TinyFish automation..."
echo "URL: $URL"
echo "Goal: $GOAL"
echo ""

curl -N -X POST "https://agent.tinyfish.ai/api/v1/automation/run" \
  -H "X-API-Key: $TINYFISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$URL\",
    \"goal\": \"$GOAL\"
  }"
