const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ưu tiên bản build CommonJS (CJS) thay vì ESM (.mjs) trong node_modules 
// Giúp tránh lỗi 'import.meta' trên nền tảng Web của Expo SDK 55
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
