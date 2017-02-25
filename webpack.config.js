var webpack = require('webpack');
var path = require('path');

var PUBLIC_DIR = 'public/js/';

var BUILD_DIR = path.resolve(__dirname, PUBLIC_DIR + '/dist/');
var APP_DIR = path.resolve(__dirname, PUBLIC_DIR + '/app/');

var plugins = [];

if (process.env.NODE_ENV !== 'production') {
        plugins = [
            new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
    ];
}

var entry = [
    APP_DIR + '/index'
];

if (process.env.NODE_ENV !== 'production') {
    entry.push('webpack-hot-middleware/client');
}

var config = {
    entry: entry,
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader',
                // plugins: ['transform-runtime'],
            }
        ]
    },
    plugins: plugins
};

if (process.env.NODE_ENV !== 'production') {
    config['devtool'] = 'cheap-module-eval-source-map';
}

module.exports = config;