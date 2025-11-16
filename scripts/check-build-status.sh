#!/bin/bash
# Script to check EAS build status and submit when ready

echo "Checking EAS build status..."
echo ""

# Check Android builds
echo "=== Android Builds ==="
ANDROID_BUILD=$(eas build:list --platform android --limit 1 --non-interactive 2>/dev/null | grep -E "ID|Status|Version code" | head -5)
echo "$ANDROID_BUILD"

# Check iOS builds  
echo ""
echo "=== iOS Builds ==="
IOS_BUILD=$(eas build:list --platform ios --limit 1 --non-interactive 2>/dev/null | grep -E "ID|Status|Build number" | head -5)
echo "$IOS_BUILD"

echo ""
echo "To submit when builds are finished:"
echo "  eas submit --platform android --profile production"
echo "  eas submit --platform ios --profile production"
echo ""
echo "Or view builds at: https://expo.dev/accounts/benji000/projects/QuRe/builds"


