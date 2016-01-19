var path = require('path');

module.exports = {
    context: __dirname + path.sep + "src",
    entry: "./index.js",
    output: {
        path: __dirname + path.sep + "dist",
        filename: "bundle.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'babel',
            query: {
                presets: ['es2015']
            }
        }]
    }
};