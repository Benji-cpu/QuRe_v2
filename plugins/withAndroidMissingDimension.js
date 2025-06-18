// plugins/withAndroidMissingDimension.js
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidMissingDimension(config) {
  return withAppBuildGradle(config, async (config) => {
    const buildGradle = config.modResults;
    
    if (!buildGradle.contents.includes('missingDimensionStrategy')) {
      buildGradle.contents = buildGradle.contents.replace(
        /defaultConfig\s*{/,
        `defaultConfig {
        missingDimensionStrategy 'store', 'play'`
      );
    }
    
    return config;
  });
};