var path = require('path');
var webpack = require('webpack');
const outputPath = path.resolve(__dirname, 'Pack');
const AssetsPlugin = require('assets-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const app = env => {
  var cssFilename = 'Css/[name].css';
  var filename = 'Scripts/[name].js';
  var devTools = 'source-map';
  var cssLoader = 'css-loader';
  var vueAlias = 'vue/dist/vue.js';
  var plugins = [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      }),
      new webpack.ProvidePlugin({
        underscore: 'underscore',
        _: 'underscore'
      }),
      new AssetsPlugin({
        fileName: 'webpack.assets.json',
        path: outputPath
      }),
      new CleanPlugin([
          path.resolve(outputPath + '/Scripts', '*.js'),
          path.resolve(outputPath + '/Scripts', '*.js.map'),
          path.resolve(outputPath + '/Css', '*.css'),
          path.resolve(outputPath + '/Css', '*.css.map')
      ])
  ];
  if (env.NODE_ENV !== 'development') {
    cssFilename = 'Css/[name].[chunkhash].css';
    filename = 'Scripts/[name].[chunkhash].js';
    devTools = '';
    cssLoader = 'css-loader?minimize';
    vueAlias = 'vue/dist/vue.min.js';
    plugins.push(new UglifyJsPlugin());
  }
  plugins.push(new ExtractTextPlugin({ // define where to save the file
    filename: cssFilename,
    allChunks: true
  }));

  return {
    entry: {
      landingLayoutCombined: './Scripts/appInitializer.js',
      cssLanding: './Content/site.scss'
    },
    output: {
      filename: filename,
      path: outputPath
    },
    resolve: {
      modules: ['./Scripts', './node_modules'],
      extensions: ['.js'],
      alias: {
        vue: vueAlias
      }
    },

    module: {
      loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
              presets: ['env']
            }
          }
      ],
      rules: [
          { // regular css files
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
              loader: 'css-loader?importLoaders=1'
            })
          },
          { // sass / scss loader for webpack
            test: /\.(sass|scss)$/,
            loader: ExtractTextPlugin.extract([cssLoader, 'sass-loader'])
          }
      ]
    },
    plugins: plugins,
    stats: {
      colors: true
    },
    devtool: devTools
  };
};
module.exports = app;