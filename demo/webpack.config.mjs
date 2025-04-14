import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const entryFile = './demo/src/index.ts'
const outputDir = path.resolve(__dirname, './demo/dist')

export default {
  entry: entryFile,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Graphic Demo',
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: outputDir,
  },
  devServer: {
    static: outputDir,
    compress: true,
    port: 4000,
  },
}
