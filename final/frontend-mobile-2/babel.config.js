module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
          },
        },
      ],
      '@babel/plugin-syntax-import-meta',
      'babel-plugin-transform-import-meta',
    ],
    overrides: [
      {
        test: /[\\/]node_modules[\\/](@clerk|@tanstack)[\\/]/,
        plugins: ['babel-plugin-transform-import-meta'],
      },
    ],
  };
};
