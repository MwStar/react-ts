const path = require('path');
const { isDev, PROJECT_PATH } = require('../constants');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin'); // 在打包时能把 public/ 文件夹下的静态资源复制到我们打包后生成的 dist 目录中
const WebpackBar = require('webpackbar'); // 显示打包的进度
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin'); // 打包时或启动本地服务时给予错误提示

// 此插件在webpack4中适用，webpack5支持缓存开箱即用, 配置cache字段 https://webpack.js.org/configuration/cache/#cache
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin'); // 提高二次编译速度，它为程序中的模块（如 lodash）提供了一个中间缓存，放到本项目 node_modules/.cache/hard-source 下

const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离出样式文件
const TerserPlugin = require('terser-webpack-plugin'); // js代码压缩, 去除注释
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css 代码压缩

const getCssLoaders = (importLoaders) => [
  isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      modules: false, // 默认就是 false, 若要开启，可在官网具体查看可配置项
      sourceMap: isDev, // 开启后与 devtool 设置一致, 开发环境开启，生产环境关闭
      importLoaders, // 指定在 CSS loader 处理前使用的 laoder 数量
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          // 修复一些和 flex 布局相关的 bug
          require('postcss-flexbugs-fixes'),
          // 将最新的 CSS 语法转换为目标环境的浏览器能够理解的 CSS 语法
          require('postcss-preset-env')({
            autoprefixer: {
              grid: true,
              flexbox: 'no-2009',
            },
            stage: 3,
          }),
          // 从 browserslist 中自动导入所需要的 normalize.css 内容
          require('postcss-normalize'),
        ],
      },
      sourceMap: isDev,
    },
  },
];

module.exports = {
  entry: {
    app: path.resolve(PROJECT_PATH, './src/index.tsx'),
  },
  output: {
    filename: `js/[name]${isDev ? '' : '.[hash:8]'}.js`,
    path: path.resolve(PROJECT_PATH, './dist'),
  },
  resolve: {
    // 定义好文件后缀名后，在 import 某个文件的时候就可以不加文件后缀名了,webpack 会按照定义的后缀名的顺序依次处理文件
    extensions: ['.tsx', '.ts', '.js', '.json'],
    // 与tsconfig.json里paths配置一致，  支持通过Components引入（打包或开发时进行路径映射替换）
    alias: {
      Src: path.resolve(PROJECT_PATH, './src'),
      Components: path.resolve(PROJECT_PATH, './src/components'),
      Utils: path.resolve(PROJECT_PATH, './src/utils'),
    },
  },
  optimization: {
    // 代码压缩
    minimize: !isDev, // 指定压缩器，如果我们设为 true ，就默认使用 terser-webpack-plugin ，设为 false 即不压缩代码
    minimizer: [
      !isDev &&
        new TerserPlugin({
          extractComments: false, // 设为 false 意味着去除所有注释，除了有特殊标记的注释，比如 @preserve 标记
          terserOptions: {
            compress: { pure_funcs: ['console.log'] }, // 设置我们想要去除的函数
          },
        }),
      !isDev && new OptimizeCSSAssetsPlugin(),
    ].filter(Boolean),

    // 将第三方依赖 打出来独立 chunk
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(PROJECT_PATH, './public/index.html'),
      filename: 'index.html',
      cache: false, // 特别重要：防止之后使用v6版本 copy-webpack-plugin 时代码修改一刷新页面为空问题。
      minify: isDev
        ? false
        : {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            removeComments: true,
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            minifyURLs: true,
            useShortDoctype: true,
          },
    }),
    new CopyPlugin({
      patterns: [
        {
          context: path.resolve(PROJECT_PATH, './public'),
          from: '*',
          to: path.resolve(PROJECT_PATH, './dist'),
          //忽略掉index.html静态文件，会导致 Multiple assets emit different content to the same filename index.html
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ['**/index.html'],
          },
          toType: 'dir',
        },
      ],
    }),
    new WebpackBar({
      name: isDev ? '正在启动' : '正在打包',
      color: '#fa8c16',
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(PROJECT_PATH, './tsconfig.json'),
      },
    }),
    // new HardSourceWebpackPlugin(),

    !isDev &&
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].css',
        ignoreOrder: false,
      }),
  ],
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: getCssLoaders(1),
      },
      {
        test: /\.less$/,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'less-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      // 处理文件
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10 * 1024,
              name: '[name].[contenthash:8].[ext]',
              outputPath: 'assets/images',
            },
          },
        ],
      },
      // 处理字体文件
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[contenthash:8].[ext]',
              outputPath: 'assets/fonts',
            },
          },
        ],
      },
    ],
  },
};
