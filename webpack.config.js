const path = require("path");
const webpack = require("webpack");
const BomPlugin = require("webpack-utf8-bom");
const { exec } = require("node:child_process");
const TerserPlugin = require("terser-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

const config = {
    entry: "./src/main.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: () => "mybbcode" + (isProduction ? ".min" : "") + ".js",
    },
    plugins: [
        new BomPlugin(true),
        {
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
                    exec("./upload.sh", (err, stdout, stderr) => {
                        if (stdout) process.stdout.write(stdout);
                        if (stderr) process.stderr.write(stderr);
                        console.log("Uploaded.");
                    });
                });
            },
        },
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: "asset",
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
    },
    externals: {
        jquery: "jQuery",
    },
    watchOptions: {
        aggregateTimeout: 20,
    },
    optimization: {
        minimize: isProduction,
        minimizer: [new TerserPlugin({
            terserOptions: {
                compress: true,
            },
            minify: TerserPlugin.uglifyJsMinify,
        })],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = "production";
    } else {
        config.mode = "development";
    }
    return config;
};
