// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript path mapping
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Ensure proper file extensions are resolved
config.resolver.sourceExts.push('cjs');

module.exports = config;