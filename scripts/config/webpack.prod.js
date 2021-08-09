const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const glob = require('glob'); // 查找文件路径
const PurgeCSSPlugin = require('purgecss-webpack-plugin'); // 去除无用样式
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 打包文件大小分析，执行npm run build 自动打开浏览器

const { PROJECT_PATH } = require('../constants');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production', // 自动开启 tree-shaking
  // devtool: 'none', // 无源码（添加之后打包会报错，暂不清楚原因）
  plugins: [
    new CleanWebpackPlugin(), //每次打包之前清理dist目录
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.resolve(PROJECT_PATH, './src')}/**/*.{tsx,scss,less,css}`, { nodir: true }), // nodir 去除文件夹的路径，加快处理速度
      whitelist: ['html', 'body'],
    }),
    // terser-webpack-plugin, 打包时会把代码中所有注释去除, 我们希望别人在使用我们开发的包时，可以看到我们自己写好的声明注释（比如 react 就有）//
    new webpack.BannerPlugin({
      raw: true,
      banner: '/** @preserve Powered by react-ts create by liangli*/',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'server', // 开一个本地服务查看报告
      analyzerHost: '127.0.0.1', // host 设置
      analyzerPort: 8888, // 端口号设置
    }),
  ],
});
