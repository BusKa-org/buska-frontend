const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './index.web.js',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true, // Crucial for React Navigation
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs|ts|tsx)$/,
        // Many native libs need to be processed by babel-loader to work on web.
        exclude: /node_modules\/(?!(react-native-vector-icons|react-native-safe-area-context|react-native-screens|@react-navigation|expo-font|@expo-google-fonts)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            // Using the Metro preset ensures compatibility with React Native code
            presets: ['module:metro-react-native-babel-preset', '@babel/preset-react'],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ttf|otf|woff|woff2|eot)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-vector-icons': 'react-native-vector-icons/dist',
    },
    extensions: ['.web.js', '.js', '.jsx', '.json', '.mjs', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: process.env.NODE_ENV !== 'production' || true,
    }),
    new Dotenv({
      path: './.env', // Garante que ele leia o arquivo da raiz
      safe: false,    // Define como true se quiser carregar um .env.example
      systemvars: true // Permite carregar variáveis do sistema também
    }),
  ],
};