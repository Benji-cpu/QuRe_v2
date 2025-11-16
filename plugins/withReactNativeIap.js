const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withReactNativeIap(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('missingDimensionStrategy "store", "play"')) {
      return config;
    }

    const defaultConfigRegex = /(defaultConfig\s*{[^}]*)/;
    const match = config.modResults.contents.match(defaultConfigRegex);
    
    if (match) {
      const defaultConfigBlock = match[1];
      const newDefaultConfigBlock = defaultConfigBlock + '\n        missingDimensionStrategy "store", "play"';
      config.modResults.contents = config.modResults.contents.replace(defaultConfigRegex, newDefaultConfigBlock);
    }

    return config;
  });
};