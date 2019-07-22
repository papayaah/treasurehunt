const webpack = require("webpack")
const merge = require("webpack-merge")
const path = require("path")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const base = require("./base")

module.exports = merge(base, {
  mode: "development",
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/assets', '**', '*'),
        to: path.resolve(__dirname, 'dev')
      }
    ])
  ]
})