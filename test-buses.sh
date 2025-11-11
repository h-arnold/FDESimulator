#!/bin/bash
# Test script to verify the updated FDE simulator with buses

echo "Testing FDE Simulator with Bus Visualization..."

URL="file:///workspaces/FDESimulator/fde-simulator/index.html"

# Test 1: Check page loads
echo -e "\n✓ Test 1: Checking page loads..."
OUT=$(npm run client -- navigate "$URL" 2>&1)
if echo "$OUT" | grep -q "Fetch-Decode-Execute Cycle Simulator"; then
  echo "  ✓ Page title correct"
else
  echo "  ✗ Page title missing"
  exit 1
fi

# Test 2: Check buses are present
echo -e "\n✓ Test 2: Checking buses are present..."
if echo "$OUT" | grep -q "Address Bus" && \
   echo "$OUT" | grep -q "Data Bus" && \
   echo "$OUT" | grep -q "Control Bus"; then
  echo "  ✓ All three buses present"
else
  echo "  ✗ Buses missing"
  exit 1
fi

# Test 3: Check CPU components
echo -e "\n✓ Test 3: Checking CPU components..."
if echo "$OUT" | grep -q "Control Unit (CU)" && \
   echo "$OUT" | grep -q "Arithmetic Logic Unit (ALU)" && \
   echo "$OUT" | grep -q "Accumulator (ACC)"; then
  echo "  ✓ CPU components present"
else
  echo "  ✗ CPU components missing"
  exit 1
fi

# Test 4: Check Memory
echo -e "\n✓ Test 4: Checking Memory (RAM)..."
if echo "$OUT" | grep -q "Memory (RAM)" && \
   echo "$OUT" | grep -q "LOAD 5" && \
   echo "$OUT" | grep -q "ADD 6"; then
  echo "  ✓ Memory present with program"
else
  echo "  ✗ Memory or program missing"
  exit 1
fi

# Test 5: Visual screenshot
echo -e "\n✓ Test 5: Taking visual screenshot..."
npm run client -- screenshot "$URL" screenshots/test-result.png > /dev/null 2>&1
if [ -f screenshots/test-result.png ]; then
  echo "  ✓ Screenshot saved to screenshots/test-result.png"
else
  echo "  ✗ Screenshot failed"
  exit 1
fi

echo -e "\n✅ All tests passed!"
echo "Visual inspection recommended: screenshots/test-result.png"
