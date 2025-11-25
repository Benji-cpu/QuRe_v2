const fs = require('fs');
const path = require('path');

// Paths to files
const paths = {
  appConfig: path.join(__dirname, '../app.config.ts'),
  androidGradle: path.join(__dirname, '../android/app/build.gradle'),
  iosPlist: path.join(__dirname, '../ios/QuRe/Info.plist'),
  packageJson: path.join(__dirname, '../package.json'),
};

function updateVersion() {
  try {
    // 1. Read current version code from app.config.ts (source of truth)
    const appConfigContent = fs.readFileSync(paths.appConfig, 'utf8');
    const versionCodeMatch = appConfigContent.match(/versionCode:\s*(\d+)/);
    
    if (!versionCodeMatch) {
      console.error('Could not find versionCode in app.config.ts');
      process.exit(1);
    }

    const currentVersionCode = parseInt(versionCodeMatch[1], 10);
    const newVersionCode = currentVersionCode + 1;

    console.log(`Bumping version code from ${currentVersionCode} to ${newVersionCode}...`);

    // 2. Update app.config.ts
    let newAppConfig = appConfigContent.replace(
      /versionCode:\s*\d+/,
      `versionCode: ${newVersionCode}`
    );
    // Update iOS build number in app.config.ts as well
    newAppConfig = newAppConfig.replace(
      /buildNumber:\s*"\d+"/,
      `buildNumber: "${newVersionCode}"`
    );
    fs.writeFileSync(paths.appConfig, newAppConfig);
    console.log('✅ Updated app.config.ts');

    // 3. Update android/app/build.gradle
    if (fs.existsSync(paths.androidGradle)) {
      const gradleContent = fs.readFileSync(paths.androidGradle, 'utf8');
      const newGradleContent = gradleContent.replace(
        /versionCode\s+\d+/,
        `versionCode ${newVersionCode}`
      );
      fs.writeFileSync(paths.androidGradle, newGradleContent);
      console.log('✅ Updated android/app/build.gradle');
    } else {
      console.log('⚠️  android/app/build.gradle not found, skipping...');
    }

    // 4. Update ios/QuRe/Info.plist
    if (fs.existsSync(paths.iosPlist)) {
      const plistContent = fs.readFileSync(paths.iosPlist, 'utf8');
      // CFBundleVersion is the build number key
      // Look for <key>CFBundleVersion</key> followed by <string>...</string>
      const newPlistContent = plistContent.replace(
        /(<key>CFBundleVersion<\/key>\s*<string>)(\d+)(<\/string>)/,
        `$1${newVersionCode}$3`
      );
      fs.writeFileSync(paths.iosPlist, newPlistContent);
      console.log('✅ Updated ios/QuRe/Info.plist');
    } else {
      console.log('⚠️  ios/QuRe/Info.plist not found, skipping...');
    }

    console.log(`\n🎉 Version bumped to ${newVersionCode} successfully!`);
    console.log('You can now run your build command.');

  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

updateVersion();

