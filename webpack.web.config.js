const webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    path = require('path');

module.exports = {
    entry: webpackConfig.entry,
    target: 'web',
    node: {
        zlib: "empty"
    },
    output: {
        path: path.resolve(__dirname + '/dist/web'),
        publicPath: '/dist/web/',
        filename: 'asdata.min.js',
        library: 'asdata',
        libraryTarget: 'var'
    },
    resolve: webpackConfig.resolve,
    plugins: webpackConfig.plugins,
    module: webpackConfig.module
};
