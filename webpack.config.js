const webpack = require('webpack'),
    path = require('path');

module.exports = {
    entry: ['./dist/index.js'],
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.js']
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
