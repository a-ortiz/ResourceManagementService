const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

const rootDirectory = path.join(__dirname);

const config = {
  entry: [
    'babel-polyfill',
    path.join(rootDirectory)
  ],
  output: {
    path: path.join(rootDirectory, 'build'),
    filename: 'index.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: [
            'es2015'
          ],
          plugins: [
            'syntax-async-functions',
            'transform-regenerator'
          ]
        }
      }
    ]
  },
  resolveLoader: {
    modulesDirectories: [
      path.join(rootDirectory, 'node_modules')
    ]
  },
  // externals: fs
  //   .readdirSync(path.join(rootDirectory, 'node_modules'))
  //   .filter(mod => mod !== '.bin')
  //   .map(mod => ({ [mod]: `commonjs ${mod}` }))
  //   .reduce((ext, mod) => Object.assign({}, ext, mod), {}),
  // target: 'node',
  // node: {
  //   __dirname: true,
  //   __filename: true
  // }
};

module.exports = config;
