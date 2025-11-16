# iOS Non-Interactive Build & Submit Setup

## Solution Found ✅

iOS builds can run non-interactively using the `--freeze-credentials` flag, which reuses credentials stored from previous builds.

## How It Works

When you've successfully built iOS before (like the build from Sept 24), EAS stores your iOS credentials on their servers. The `--freeze-credentials` flag tells EAS to use those stored credentials instead of prompting for new authentication.

## Commands

### Build iOS (Non-Interactive)
```bash
eas build --platform ios --profile production --non-interactive --freeze-credentials
```

### Build + Auto-Submit iOS (Non-Interactive)
```bash
eas build --platform ios --profile production --non-interactive --freeze-credentials --auto-submit
```

## Current Status

✅ **Working**: iOS build is now running with stored credentials
- Build started: Current session
- Using stored credentials from previous build (Sept 24)
- Credentials include:
  - Distribution Certificate (expires Aug 2026)
  - Provisioning Profile (expires Aug 2026)
  - Apple Team: 6G62Q6BH3X

## First-Time Setup

If you haven't built iOS before or need to refresh credentials:

1. **Run interactively once** to store credentials:
   ```bash
   eas build --platform ios --profile production
   ```
   - Provide Apple ID when prompted
   - EAS will store credentials for future use

2. **Future builds** can use non-interactive mode:
   ```bash
   eas build --platform ios --profile production --non-interactive --freeze-credentials
   ```

## Important Notes

- **Credentials Expiry**: Certificates expire in Aug 2026. Before expiry, you'll need to refresh credentials interactively.
- **First Build**: Must be run interactively to establish credentials
- **Team Changes**: If Apple Team changes, you'll need to refresh credentials interactively
- **Security**: Credentials are stored securely on EAS servers, not locally

## Troubleshooting

**Error: "Credentials not found"**
- Run build interactively once to establish credentials
- Check if bundle identifier matches: `com.qureapp.app`

**Error: "Credentials expired"**
- Run `eas credentials --platform ios` to refresh
- Or run build interactively once to update credentials

**Error: "Team ID mismatch"**
- Verify team ID in `eas.json` matches your Apple Developer account
- Current team ID: `6G62Q6BH3X`

---

**Last Updated**: During iOS build setup
**Status**: ✅ Working with `--freeze-credentials` flag


