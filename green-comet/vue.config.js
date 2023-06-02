const { VuetifyPlugin } = require('webpack-plugin-vuetify');
const { defineConfig } = require("@vue/cli-service")

module.exports = defineConfig({
  publicPath: "./",
  
  configureWebpack: {
    plugins: [
      new VuetifyPlugin()
    ]
  },

  // Needed for BrowserStack/Safari testing as of 2023 March. This makes the
  // dev server insecure, but that's OK since we only use it in controlled
  // circumstances. https://stackoverflow.com/questions/43619644
  devServer: {
    allowedHosts: 'all'
  }
});
