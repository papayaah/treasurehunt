const merge = require("webpack-merge")
const path = require("path")
const base = require("./base")
const TerserPlugin = require("terser-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(base, {
  mode: "production",
  output: {
    filename: "bundle.min.js"
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/assets', '**', '*'),
        to: path.resolve(__dirname, '../dist')
      }
    ])
  ]
})