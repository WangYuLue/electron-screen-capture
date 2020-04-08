const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const spawn = require('child_process').spawn;

module.exports = {
  target: 'electron-renderer',
  mode: 'development',
  entry: {
    app: './src/index.tsx',
    screenCapture: './windows/screen-capture/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  devServer: {
    port: 3000,
    after() {
      spawn('npm', ['run', 'start-electron'], {
        shell: true,
        env: process.env,
        stdio: 'inherit'
      })
        .on('close', code => process.exit(code))
        .on('error', spawnError => console.error(spawnError));
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      "@container": path.resolve(__dirname, 'src/container/'),
      "@utils": path.resolve(__dirname, 'src/utils/')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
      chunks: ['app'],
    }),
    new HtmlWebpackPlugin({
      filename: 'screenCapture.html',
      template: './windows/screen-capture/index.html',
      chunks: ['screenCapture'],
    })
  ]
};