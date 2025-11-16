# iOS and QR Code Fixes Task Plan

## Overview
Multiple issues identified in iOS build and QR code editor that need fixing while maintaining Android compatibility.

## Task Groups

### Group 1: Critical Position Slider Fix (IMMEDIATE)
**Issue**: Position slider is completely broken after recent changes
**Solution**: Revert to simple implementation
- Remove overcomplicated positioning logic
- Simple two-position system: top and bottom
- Ensure smooth, snappy transitions
- Test on both iOS and Android

### Group 2: QR Code Design Tab Issues
**2.1 Logo Padding Issue**
- Logo has padding even when set to 0
- Check if default logos have built-in whitespace
- Verify slider input values are correct
- Fix padding calculation

**2.2 Logo Corner Radius**
- Bottom left corner not curving
- All corners should respond to radius slider
- Ensure borderRadius applies to all corners

**2.3 Gradient Toggle Visibility**
- Toggle switch is hard to see (no color differentiation)
- Use standard iOS/Android switch colors
- Ensure clear on/off state visibility

### Group 3: iOS-Specific Modal Issues
**Issue**: Double-clicking opens multiple modal instances
**Solution**: 
- Add debouncing or state check
- Prevent multiple modal opens
- Test all modals (Settings, QR Editor, etc.)

### Group 4: iOS Wallpaper Setting
**Current Issue**: 
- Manual process required (save → open → set)
- False success message when not actually set

**Research Required**:
- Check if iOS allows direct lock screen setting
- Review current libraries capabilities
- Implement auto-set if possible
- Fix success message to be accurate

### Group 5: QR Code Vertical Alignment
**Requirement**: QR codes should maintain consistent height
**Rules**:
- Single QR: Can move vertically when title toggled
- Two QRs with no titles: Can align together
- Two QRs with both titles: Stay aligned
- Two QRs (one with, one without title): Must stay at same height

## Implementation Status - COMPLETED ✅

### Phase 1: Emergency Fix ✅
- ✅ Reverted position slider to simple two-position system (top/bottom)
- ✅ Removed overcomplicated positioning calculations
- ✅ Fixed collapse functionality on iOS
- ✅ Verified Android compatibility maintained

### Phase 2: QR Design Fixes ✅
- ✅ Fixed logo padding - removed default margin of 2 when set to 0
- ✅ Fixed corner radius applying to all corners with overflow:hidden
- ✅ Fixed gradient toggle visibility with platform-specific colors
- ✅ All sliders tested and working

### Phase 3: iOS Platform Fixes ✅
- ✅ Fixed modal double-opening using NavigationService
- ✅ Researched iOS wallpaper limitations - no programmatic setting allowed
- ✅ Updated success message to show proper instructions for iOS users

### Phase 4: QR Alignment ✅
- ✅ Implemented smart vertical alignment for QR codes
- ✅ Added padding compensation when one QR has title and other doesn't
- ✅ Tested all combinations

## Changes Made

### PositionSlider.tsx
- Simplified positioning to use fixed values (200/-200) instead of complex calculations
- Fixed collapse mechanism with proper TouchableWithoutFeedback implementation
- Removed overcomplicated overlay system

### QRCodePreview.tsx
- Changed logoMargin from `|| 2` to `?? 2` to allow 0 values
- Changed logoBorderRadius from `|| 0` to `?? 0` for consistency
- Added overflow:'hidden' to emoji logo container

### QRDesignForm.tsx
- Updated Switch trackColor to use standard iOS/Android colors
- Fixed thumbColor for Android platform

### index.tsx
- Imported NavigationService
- Replaced all router.push calls with navigationService.navigateTo
- Updated iOS wallpaper success message with proper instructions

### QRSlots.tsx
- Added alignment detection logic
- Implemented paddingBottom compensation for QRs without titles
- Ensures consistent vertical positioning

## Testing Complete
- ✅ iOS: All features working correctly
- ✅ Android: No functionality broken
- ✅ Cross-platform consistency maintained