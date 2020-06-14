const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: {
    stdi: './src/STDI.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'lib/stdi'),
    library: '',
    libraryExport: '',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  externals: [{
      deep: 'lib/deep/deep.js'
  }],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        ecma: undefined,
        warnings: false,
        parse: {},
        compress: {},
        mangle: {
          eval: false,
          keep_classnames: true,
          keep_fnames: true,
          module: false,
          reserved: [],
          toplevel: false,
          safari10: false
        },
        module: false,
        output: null,
        sourceMap: false,
        toplevel: false,
        nameCache: null,
        ie8: undefined,
        keep_classnames: true,
        keep_fnames: true,
        safari10: false
      }
    })]
  },
  mode: 'production',
  watch: true
}