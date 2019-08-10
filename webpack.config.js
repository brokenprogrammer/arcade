var path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/js/main.js',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    port: 4000,
    public: 'localhost:4000',
    watchContentBase: true
  },
  devtool: 'cheap-eval-source-map',
  module: {
    rules: [
    //   {
    //     // set up standard-loader as a preloader
    //     enforce: 'pre',
    //     test: /\.jsx?$/,
    //     loader: 'standard-loader',
    //     exclude: /(node_modules)/,
    //     options: {
    //       // Emit errors instead of warnings (default = false)
    //       error: false,
    //       // enable snazzy output (default = true)
    //       snazzy: true
    //     }
    //   },
      {
        test: /\.html$/,
        use: [{ loader: 'html-loader' }]
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      //favicon: './src/favicon.ico',
      filename: 'index.html',
      inject: false
    })
  ]
}
