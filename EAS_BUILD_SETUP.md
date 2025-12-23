# EAS Build Setup Guide

## Issue: Certificate Not Validated for Non-Interactive Builds

When running EAS builds in non-interactive mode (CI/CD), you may encounter:
```
Certificate is not validated for non-interactive builds.
Failed to set up credentials.
Credentials are not set up. Run this command again in interactive mode.
```

## Solution

### Step 1: Set Up Credentials Interactively (One-Time Setup)

Before running non-interactive builds, you must set up credentials in interactive mode:

```bash
# Navigate to the project directory
cd /Users/hhtraders/Projects/OpenMenuRider

# Set up iOS credentials interactively
npx eas-cli@latest credentials

# Follow the prompts:
# 1. Select "iOS" platform
# 2. Select "production" profile
# 3. Choose to set up credentials automatically (recommended)
#    OR manually provide:
#    - Apple Developer Account credentials
#    - Distribution certificate
#    - Provisioning profile
```

### Step 2: Verify Credentials Are Set Up

Check if credentials are configured:

```bash
npx eas-cli@latest credentials
# Select iOS > production
# Verify that credentials are listed
```

### Step 3: Run Non-Interactive Builds

Once credentials are set up, you can run non-interactive builds:

```bash
# For iOS production build
npx eas-cli@latest build --platform ios --profile production --non-interactive

# Or using the build:internal command
npx eas-cli@latest build:internal --platform ios --profile production
```

## Alternative: Manual Credential Setup

If automatic setup doesn't work, you can manually configure credentials:

### Option 1: Use Existing Certificates

```bash
# If you have existing certificates
npx eas-cli@latest credentials
# Select: iOS > production > Set up manually
# Provide your:
# - Distribution certificate (.p12 file)
# - Provisioning profile (.mobileprovision file)
# - Apple App-Specific Password (if using 2FA)
```

### Option 2: Generate New Certificates

```bash
# Generate new certificates through EAS
npx eas-cli@latest credentials
# Select: iOS > production > Generate new credentials
# EAS will guide you through the process
```

## For CI/CD Pipelines

If you're running builds in CI/CD, ensure:

1. **Credentials are pre-configured** (run Step 1 above first)
2. **Use non-interactive flag**:
   ```bash
   npx eas-cli@latest build --platform ios --profile production --non-interactive
   ```

3. **Or use environment variables** (if needed):
   ```bash
   export EXPO_TOKEN=your_expo_token
   npx eas-cli@latest build --platform ios --profile production --non-interactive
   ```

## Troubleshooting

### Error: "Credentials are not set up"

**Solution**: Run credentials setup in interactive mode first:
```bash
npx eas-cli@latest credentials
```

### Error: "Certificate is not validated"

**Solution**: 
1. Check your Apple Developer account status
2. Ensure your distribution certificate hasn't expired
3. Re-run credential setup:
   ```bash
   npx eas-cli@latest credentials
   # Select iOS > production > Update credentials
   ```

### Error: "Apple ID authentication failed"

**Solution**:
1. Use an App-Specific Password if you have 2FA enabled
2. Generate one at: https://appleid.apple.com/account/manage
3. Use it when prompted during credential setup

## Quick Reference Commands

```bash
# Set up credentials (interactive)
npx eas-cli@latest credentials

# Check credential status
npx eas-cli@latest credentials --platform ios

# Build iOS production (interactive)
npx eas-cli@latest build --platform ios --profile production

# Build iOS production (non-interactive - requires pre-setup)
npx eas-cli@latest build --platform ios --profile production --non-interactive

# View build status
npx eas-cli@latest build:list
```

## Notes

- Credentials are stored securely in EAS servers
- Once set up, they can be reused for future builds
- Distribution certificates typically expire after 1 year
- You'll need to update credentials when certificates expire

