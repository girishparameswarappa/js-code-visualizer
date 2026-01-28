const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/js/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/js-code-visualizer/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js'],
    fallback: {
      // js-interpreter has optional Node.js vm dependency - not needed in browser
      "vm": false
    }
  },
};
