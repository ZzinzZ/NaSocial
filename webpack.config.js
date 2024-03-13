const path = require("path");
const nodeExternals = require("webpack-node-externals");
const WebpackShellPlugin = require("webpack-shell-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const { NODE_ENV = "production" } = process.env;
module.exports = {
  entry: "./src/server.ts",
  watch: NODE_ENV === "development",
  mode: NODE_ENV,
  target: "node",
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        // option
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
    ],
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ["yarn run:dev"],
    }),
  ],
};
