const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");

module.exports = defineConfig({
  publicPath: "./",

  chainWebpack: config => {
    // These are some necessary steps changing the default webpack config of the Vue CLI
    // that need to be changed in order for Typescript based components to generate their
    // declaration (.d.ts) files.
    //
    // Discussed here https://github.com/vuejs/vue-cli/issues/1081
    if (process.env.NODE_ENV === 'production') {
      config.module.rule("ts").uses.delete("cache-loader");

      config.module
        .rule('ts')
        .use('ts-loader')
        .loader('ts-loader')
        .tap(opts => {
          opts.transpileOnly = false;
          opts.happyPackMode = false;
          return opts;
        });
    }

    // Keep the very big WWT engine external
    config.externals({
      '@wwtelescope/engine': {
        'amd': '@wwtelescope/engine', // typeof define === 'function' && define.amd
        'commonjs2': '@wwtelescope/engine', // typeof exports === 'object' && typeof module === 'object'
        'commonjs': '@wwtelescope/engine', // typeof exports === 'object'
        'root': 'wwtlib' // none of the above: browser mode using global variables
      }
    });

  },

  // TODO: For some reason we're having trouble loading chunks
  // so until that's resolved, prevent JS chunking for this package
  configureWebpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    ]
  },

  // Also needed for the TypeScript declaration stuff (see link above)
  parallel: false,

  // Keep any CSS inside JS for transparent loading as a library.
  css: {
    extract: false
  }
});
