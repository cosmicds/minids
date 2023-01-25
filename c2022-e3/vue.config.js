const { VuetifyPlugin } = require('webpack-plugin-vuetify');
const { defineConfig } = require("@vue/cli-service")

module.exports = defineConfig({
  publicPath: "./",
  devServer: {
    https: true
  },
  
  configureWebpack: {
    plugins: [
      new VuetifyPlugin()
    ]
  }
});
