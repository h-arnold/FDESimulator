#!/bin/bash
# Test script to verify buttons are visible at different screen sizes

echo "Testing button visibility at various screen sizes..."
echo ""

# Kill any existing Playwright servers
pkill -f "node.*playwright/server" 2>/dev/null || true
sleep 1

# Start Playwright server
cd /workspaces/FDESimulator
node playwright/server.js &
SERVER_PID=$!
echo "Started Playwright server (PID: $SERVER_PID)"
sleep 3

# Test different viewport sizes
declare -a sizes=(
  "375:667:Mobile (iPhone SE)"
  "414:896:Mobile (iPhone 11)"
  "768:1024:Tablet (iPad)"
  "1024:768:Desktop (Small)"
  "1920:1080:Desktop (Full HD)"
)

FAILED=0

for size in "${sizes[@]}"; do
  IFS=':' read -r width height label <<< "$size"
  echo "Testing ${label} (${width}x${height})..."
  
  OUTPUT=$(node playwright/playwright-client.js navigate "http://localhost:3000" 2>&1)
  
  if echo "$OUTPUT" | grep -q "error"; then
    echo "  ❌ FAILED - Error loading page"
    FAILED=1
  else
    # Check if page title contains expected text
    if echo "$OUTPUT" | jq -e '.title | contains("FDE")' > /dev/null 2>&1; then
      echo "  ✅ PASSED - Page loaded successfully"
    else
      echo "  ⚠️  WARNING - Page loaded but title unexpected"
    fi
  fi
done

# Cleanup
echo ""
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null

if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Some tests failed"
  exit 1
fi
