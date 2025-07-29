# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# CLAUDE.md
## Plan & Review

### Before starting work
- Always in plan mode to make a plan
- After get the plan, make sure you Write the plan to .claude/tasks/TASK_NAME.md.
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task require external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.

## Development Commands

### Primary Development
- `npm install` - Install dependencies
- `npx expo start` - Start development server with Expo Dev Client
- `npm run start` - Alias for expo start with dev-client flag
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run web version

### Build and Testing
- `npm run prebuild` - Generate native code for development builds
- `npm run lint` - Run ESLint on the codebase
- `npm run reset-project` - Reset project to clean state (moves starter code to app-example)

### EAS Build (Production)
- `eas build --platform android --profile production` - Production Android build
- `eas build --platform ios --profile production` - Production iOS build
- `eas submit --platform android` - Submit to Google Play Store
- `eas submit --platform ios` - Submit to App Store

## Application Architecture

### Core Structure
This is a React Native Expo app using Expo Router for navigation with a specialized focus on QR code generation and wallpaper creation.

**Key Navigation Structure:**
- `app/index.tsx` - Main home screen with wallpaper preview and QR positioning
- `app/_layout.tsx` - Root layout with global providers and navigation configuration
- `app/modal/` - Modal screens for QR code creation, settings, premium features, etc.

### State Management
The app uses React Context for global state:
- `AppStateProvider` - Application-wide state management
- `ThemeProvider` - Theme and appearance management with light/dark mode support

### Core Services Architecture
- `QRStorage.ts` - QR code data persistence and management
- `UserPreferences.ts` - User settings and preferences storage
- `IAPService.ts` - In-app purchase management for premium features
- `QRGenerator.ts` - QR code generation with design customization
- `WallpaperService.ts` - Lock screen wallpaper setting functionality
- `EngagementPricingService.ts` - User engagement tracking and premium pricing
- `ThemeService.ts` - Theme switching and appearance management
- `NavigationService.ts` - Navigation utilities and helpers

### QR Code System
The app supports multiple QR code types defined in `constants/QRTypes.ts`:
- **Basic**: Link, Instagram, WhatsApp, Email, Phone, Contact
- **Payments**: PayPal, Wise (international transfers), Bitcoin
- Each type has specific field configurations and validation rules

### Premium Features
- Dual QR code slots (primary + secondary)  
- Custom background images (beyond gradient presets)
- Advanced QR positioning and scaling
- Title visibility toggle
- Enhanced customization options

### UI Architecture
- **Home Screen Components**: Located in `app/components/home/`
  - `GradientBackground.tsx` - Animated gradient backgrounds with custom image support
  - `QRSlots.tsx` - QR code positioning and display system
  - `TimeDisplay.tsx` - Lock screen time display
  - `ActionCards.tsx` - Export/share/settings buttons
  - `PositionSlider.tsx` - QR positioning controls with expand/collapse
  - `SwipeIndicator.tsx` - User onboarding swipe hints

- **QR Design Components**: Located in `app/components/qr-design/`
  - Complete QR customization system with colors, gradients, logos

### Key Features
1. **Wallpaper Generation**: Captures home screen as lock screen wallpaper
2. **QR Positioning**: Precise X/Y positioning and scaling with real-time preview
3. **Background System**: Gradient presets + custom images (premium)
4. **Export/Share**: Direct wallpaper setting and sharing capabilities
5. **Onboarding**: First-time user guidance system
6. **Analytics**: User engagement tracking for premium conversion

### File Organization
- `app/` - Expo Router pages and components
- `services/` - Business logic and data management
- `contexts/` - React Context providers
- `types/` - TypeScript type definitions
- `constants/` - Static data (gradients, QR types, icons)
- `assets/` - Images, fonts, and static assets
- `config/` - Configuration files (IAP, etc.)

### Platform-Specific Features
- **Android**: SET_WALLPAPER permission, APK/AAB builds, Google Play Store submission
- **iOS**: Wallpaper setting via system APIs, TestFlight distribution
- **Cross-platform**: Expo sharing, haptics, image picker, media library access

### Development Notes
- Uses Expo SDK 53 with new architecture enabled
- TypeScript with strict mode enabled
- File-based routing with typed routes experiment
- Development builds required (not Expo Go compatible due to native modules)
- EAS Build configured for internal testing and production releases

### Common Development Patterns
- Async/await pattern for all service calls
- Error boundaries and graceful error handling
- Debounced user input for performance (position changes)
- Gesture-based navigation (swipe between gradients)
- Memory-efficient image handling and caching
- Premium feature gating throughout the UI