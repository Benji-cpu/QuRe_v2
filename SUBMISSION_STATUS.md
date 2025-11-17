# Submission Status

## Current Status

### Android ✅
- **Status**: Building and will auto-submit
- **Process**: Build started with `--auto-submit` flag
- **Progress**: Currently compressing and uploading files
- **Expected**: Build will complete (~10-25 min), then automatically submit to Google Play Internal track

### iOS ⚠️
- **Status**: Build finished, submission blocked
- **Build ID**: `71fef491-b2c6-4cae-b64e-d8469778abd3`
- **Artifact**: https://expo.dev/artifacts/eas/f5s2v7CNoTJ8CWz2WXSSsF.ipa
- **Issue**: Auto-submit failed with `ascAppId` missing from `eas.json`
- **Next Action**:
  1. Grab the App Store Connect **Apple ID** / `ascAppId` for `com.qureapp.app` (App Store Connect → App Information → Apple ID)
  2. Update `eas.json` submit profile:
     ```json
     "submit": {
       "production": {
         "ios": {
           "appleTeamId": "6G62Q6BH3X",
           "ascAppId": "<APPLE_ID>"
         }
       }
     }
     ```
  3. Submit the newly finished build:
     ```bash
     eas submit --platform ios --profile production --latest --non-interactive --wait
     ```
- **Workaround**: Re-run `eas submit` without `--non-interactive` and select the app manually if interactive login is acceptable.

## What Happens Next

### Android (Automatic)
1. ✅ Build compresses and uploads (in progress)
2. ⏳ EAS builds the app (~10-20 minutes)
3. ⏳ Build completes
4. ⏳ Automatically submits to Google Play Console (Internal track)
5. ⏳ App will appear in Google Play Console → Internal Testing

**Note**: If the Android service account key is missing (`keys/qure-462502-90765c942128.json`), submission will fail at step 4. You'll need to add the key first (see `RELEASE_GUIDE.md`).

### iOS (Manual Required)
1. Run build interactively (provides Apple ID credentials)
2. Build completes (~15-25 minutes)
3. Auto-submits to App Store Connect
4. App appears in TestFlight (~30 minutes after submission)

## Monitor Progress

### Check Android Build:
```bash
./scripts/check-build-status.sh
```

Or view directly:
```bash
eas build:list --platform android --limit 1
```

### Check Android Submission:
```bash
# After build completes, check if submission worked
# View in Google Play Console: https://play.google.com/console
```

### Check iOS Build:
```bash
eas build:list --platform ios --limit 1
```

### View Build Dashboard:
https://expo.dev/accounts/benji000/projects/QuRe/builds

## Build Details

- **Version**: 1.0.5
- **Build Numbers**: 46 (both platforms)
- **Android Track**: Internal (configured in `eas.json`)
- **iOS Distribution**: Store (TestFlight)

## Important Notes

1. **Android Service Account Key**: Ensure `keys/qure-462502-90765c942128.json` exists for submission to work
2. **iOS Authentication**: Must run iOS build interactively to provide Apple ID credentials
3. **Build Time**: Allow 10-25 minutes for builds to complete
4. **Auto-Submit**: Android will automatically submit when build completes (if configured correctly)

---

**Last Updated**: During submission process
**Repository**: https://github.com/Benji-cpu/QuRe_v2


