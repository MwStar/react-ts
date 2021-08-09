const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');

const { SERVER_HOST, SERVER_PORT } = require('../constants');

module.exports = merge(common, {
  mode: 'development',
  target: 'web', // webpack5 必须要配置这一项，热更新才有用
  devtool: 'eval-source-map', //将编译后的代码映射回原始源代码 eval-cheap-module-source-map
  devServer: {
    host: SERVER_HOST, // 指定 host，不设置的话默认是 localhost
    port: SERVER_PORT, // 指定端口，默认是8080
    stats: 'errors-only', // 终端仅打印 error
    clientLogLevel: 'silent', // 日志等级
    compress: true, // 是否启用 gzip 压缩
    open: true, // 打开默认浏览器
    hot: true, // 热更新
  },
  plugins: [
    // 热更新
    new webpack.HotModuleReplacementPlugin(),
  ],
});
