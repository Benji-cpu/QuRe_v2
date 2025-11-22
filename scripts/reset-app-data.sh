#!/bin/bash

# Reset QuRe App Data Script
# This script helps you reset the app to a fresh install state

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}QuRe App Data Reset Script${NC}"
echo "=================================="
echo ""

# Detect platform
PLATFORM=""
if [[ "$1" == "ios" ]] || [[ "$1" == "iOS" ]]; then
    PLATFORM="ios"
elif [[ "$1" == "android" ]] || [[ "$1" == "Android" ]]; then
    PLATFORM="android"
else
    echo -e "${YELLOW}Usage: ./scripts/reset-app-data.sh [ios|android]${NC}"
    echo ""
    echo "This script will uninstall the app from the simulator/emulator,"
    echo "which clears all AsyncStorage data and resets the app to a fresh state."
    echo ""
    exit 1
fi

if [[ "$PLATFORM" == "ios" ]]; then
    echo -e "${YELLOW}Resetting iOS Simulator...${NC}"
    
    # Get the bundle identifier from app.config.ts
    # For dev: com.qureapp.app.dev
    # For prod: com.qureapp.app
    DEV_BUNDLE_ID="com.qureapp.app.dev"
    PROD_BUNDLE_ID="com.qureapp.app"
    
    # Get list of booted simulators
    BOOTED_SIMS=$(xcrun simctl list devices | grep "Booted" | head -1)
    
    if [ -z "$BOOTED_SIMS" ]; then
        echo -e "${RED}No booted iOS simulators found.${NC}"
        echo "Please start the iOS simulator first with: npm run ios"
        exit 1
    fi
    
    # Extract device UDID from booted simulators
    DEVICE_UDID=$(xcrun simctl list devices | grep "Booted" | head -1 | sed -E 's/.*\(([^)]+)\).*/\1/')
    
    if [ -z "$DEVICE_UDID" ]; then
        echo -e "${RED}Could not determine simulator UDID.${NC}"
        exit 1
    fi
    
    echo "Found booted simulator: $DEVICE_UDID"
    echo ""
    
    # Try to uninstall both dev and prod versions
    echo -e "${YELLOW}Uninstalling app (this clears all data)...${NC}"
    
    if xcrun simctl uninstall "$DEVICE_UDID" "$DEV_BUNDLE_ID" 2>/dev/null; then
        echo -e "${GREEN}✓ Uninstalled dev version${NC}"
    else
        echo -e "${YELLOW}  Dev version not found (may not be installed)${NC}"
    fi
    
    if xcrun simctl uninstall "$DEVICE_UDID" "$PROD_BUNDLE_ID" 2>/dev/null; then
        echo -e "${GREEN}✓ Uninstalled prod version${NC}"
    else
        echo -e "${YELLOW}  Prod version not found (may not be installed)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✓ App data cleared!${NC}"
    echo ""
    echo "To reinstall the app, run: npm run ios"
    
elif [[ "$PLATFORM" == "android" ]]; then
    echo -e "${YELLOW}Resetting Android Emulator...${NC}"
    
    # Check if adb is available
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}adb not found. Please install Android SDK platform-tools.${NC}"
        exit 1
    fi
    
    # Check if device is connected
    if ! adb devices | grep -q "device$"; then
        echo -e "${RED}No Android device/emulator found.${NC}"
        echo "Please start the Android emulator first with: npm run android"
        exit 1
    fi
    
    # Package names
    DEV_PACKAGE="com.anonymous.QuRe.dev"
    PROD_PACKAGE="com.anonymous.QuRe"
    
    echo -e "${YELLOW}Uninstalling app (this clears all data)...${NC}"
    
    if adb uninstall "$DEV_PACKAGE" 2>/dev/null; then
        echo -e "${GREEN}✓ Uninstalled dev version${NC}"
    else
        echo -e "${YELLOW}  Dev version not found (may not be installed)${NC}"
    fi
    
    if adb uninstall "$PROD_PACKAGE" 2>/dev/null; then
        echo -e "${GREEN}✓ Uninstalled prod version${NC}"
    else
        echo -e "${YELLOW}  Prod version not found (may not be installed)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✓ App data cleared!${NC}"
    echo ""
    echo "To reinstall the app, run: npm run android"
fi

echo ""
echo -e "${GREEN}Done! The app will be in a fresh install state on next launch.${NC}"

