# QuRe Release Guide

This guide provides step-by-step instructions for releasing QuRe to Google Play (Android) and TestFlight (iOS).

## Current Version Information

- **App Version**: 1.0.5
- **Build Number**: 46 (iOS and Android)
- **Bundle IDs**: 
  - Android: `com.anonymous.QuRe`
  - iOS: `com.qureapp.app`
- **Expo Project ID**: `382a05a5-832d-4999-980f-2d14a15d4111`
- **Expo Owner**: `benji000`
- **Apple Team ID**: `6G62Q6BH3X`

## Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
Use the account that owns the project (`benji000`).

### 3. Verify Project Setup
```bash
eas whoami
eas project:info
```

### 4. Android - Service Account Key

**IMPORTANT**: The Android submission requires a Google Play service account JSON key.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Play Android Developer API
4. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create a new service account
   - Grant it "Service Account User" role
5. Create and download a JSON key file
6. In Google Play Console:
   - Go to Setup → API access
   - Link the service account
   - Grant necessary permissions (App information, Release management)
7. Save the JSON key file as:
   ```
   keys/qure-462502-90765c942128.json
   ```
   **Note**: This file is gitignored for security. Keep it secure!

### 5. iOS - Apple Account Setup

1. Ensure you have access to App Store Connect
2. Verify the bundle ID `com.qureapp.app` exists in App Store Connect
3. Make sure you can authenticate with Apple (2FA enabled)

## Pre-Release Checklist

Before building, ensure:

- [ ] App version and build numbers are incremented in `app.config.ts`
- [ ] Code is tested and working (in-app purchases, wallpaper permissions)
- [ ] No `APP_VARIANT` or `EXPO_PUBLIC_APP_VARIANT` environment variables are set (to ensure production build)
- [ ] Android service account key is in place (`keys/qure-462502-90765c942128.json`)
- [ ] All changes are committed to git
- [ ] Release notes are prepared

## Building for Release

### Android Build

1. **Build the production bundle**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Monitor the build**:
   - The build will run on EAS servers
   - You'll see a URL to track progress
   - Typical build time: 10-20 minutes

3. **Download and test** (optional):
   ```bash
   # Build will provide download URL
   # Install on Android device to test before submission
   ```

### iOS Build

1. **Build the production archive**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **First time setup** (if needed):
   - EAS will prompt for Apple ID and password
   - It will automatically manage certificates and provisioning profiles
   - You may need to confirm in App Store Connect

3. **Monitor the build**:
   - The build will run on EAS servers
   - You'll see a URL to track progress
   - Typical build time: 15-25 minutes

4. **Download and test** (optional):
   ```bash
   # Build will provide download URL
   # Install via TestFlight to test before releasing
   ```

## Submitting to Stores

### Android - Google Play Store

1. **Submit automatically** (recommended):
   ```bash
   eas submit --platform android --profile production
   ```

   This will:
   - Use the latest production build
   - Upload to the "internal" track (as configured in `eas.json`)
   - Complete the release automatically

2. **Alternative: Manual submission**:
   - Go to [EAS Dashboard](https://expo.dev/accounts/benji000/projects/QuRe/builds)
   - Download the `.aab` file from the completed build
   - Upload to [Google Play Console](https://play.google.com/console)
   - Fill in release notes and submit for review

3. **Promote to production**:
   - In Google Play Console, go to Release → Production
   - If using internal track, promote to Alpha/Beta/Production as needed
   - Add release notes for each track

### iOS - TestFlight / App Store

1. **Submit automatically** (recommended):
   ```bash
   eas submit --platform ios --profile production
   ```

   This will:
   - Use the latest production build
   - Upload to App Store Connect
   - Appear in TestFlight within ~30 minutes

2. **Configure TestFlight**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to your app → TestFlight
   - Add testers (internal/external)
   - Add release notes for testers
   - Distribute build to testers

3. **Submit for App Store Review** (when ready):
   - Go to App Store Connect → App Store
   - Create a new version
   - Select the TestFlight build
   - Fill in metadata, screenshots, description
   - Submit for review

## Version Management

When releasing a new version, update in `app.config.ts`:

```typescript
// Increment these for each release:
version: "1.0.6",              // User-facing version
runtimeVersion: "1.0.6",       // OTA update version (usually same as version)
ios: {
  buildNumber: "47",           // Increment by 1
},
android: {
  versionCode: 47,             // Increment by 1
}
```

**Important**: 
- `runtimeVersion` must match `version` for production releases
- Build numbers must always increment (never decrement)
- Version format: `MAJOR.MINOR.PATCH` (e.g., 1.0.6)

## Troubleshooting

### Android Issues

**Build fails with signing error**:
- EAS manages signing keys automatically
- First build will create a new keystore
- Ensure you're logged in: `eas login`

**Submit fails with service account error**:
- Verify the JSON key exists: `ls keys/qure-462502-90765c942128.json`
- Check key has correct permissions in Google Play Console
- Ensure API is enabled in Google Cloud Console

### iOS Issues

**Build fails with certificate error**:
- First build: EAS will prompt for Apple credentials
- Subsequent builds: Credentials are managed automatically
- **Non-interactive builds**: Use `--freeze-credentials` flag to reuse stored credentials:
  ```bash
  eas build --platform ios --profile production --non-interactive --freeze-credentials
  ```
- If issues persist: `eas credentials` to manually manage

**Submit fails with authentication error**:
- Use App Store Connect API Key (recommended)
- Or provide Apple ID with 2FA enabled
- **For non-interactive**: Use `--freeze-credentials` flag to reuse stored credentials from previous builds
- Run `eas credentials` to configure

**TestFlight processing takes too long**:
- Normal processing: 10-30 minutes
- If stuck, check App Store Connect for error messages
- May need to re-submit if build was corrupted

### General Issues

**Build uses wrong bundle ID**:
- Check that `APP_VARIANT` environment variable is NOT set
- Verify `app.config.ts` variant resolution logic
- Production should use: `com.anonymous.QuRe` (Android) and `com.qureapp.app` (iOS)

**Version numbers not updating**:
- Clear Expo cache: `npx expo start --clear`
- Ensure `eas.json` has `"appVersionSource": "local"`
- Check `app.config.ts` version values

## Post-Release

After successful submission:

1. **Tag the release in Git**:
   ```bash
   git tag -a v1.0.5 -m "Release version 1.0.5"
   git push origin v1.0.5
   ```

2. **Update release notes** in your repo (optional)

3. **Monitor submissions**:
   - Android: Check Google Play Console for review status
   - iOS: Check App Store Connect → App Review for status

4. **Track metrics**:
   - Monitor crashes in Firebase/App Store Connect
   - Review user feedback
   - Track in-app purchase analytics

## Quick Reference Commands

```bash
# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android --profile production
eas submit --platform ios --profile production

# Build and submit in one go (when build completes)
eas build --platform android --profile production --auto-submit
eas build --platform ios --profile production --auto-submit

# Check build status
eas build:list

# View credentials
eas credentials

# Check project info
eas project:info

# View submission history
eas submit:list
```

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo Dashboard](https://expo.dev/accounts/benji000/projects/QuRe)

---

**Last Updated**: For version 1.0.5 (Build 46)
**Repository**: https://github.com/Benji-cpu/QuRe_v2

