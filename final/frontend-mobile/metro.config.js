const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tắt package exports để quay lại chế độ cũ, ưu tiên các bản build CJS thay vì ESM (.mjs)
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
