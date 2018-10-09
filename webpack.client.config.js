
const { resolve, basename } = require('path');
const { readdirSync } = require('fs');
const webpack = require('webpack');

// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


const ROOT = resolve(__dirname);
// const NAME = basename(ROOT);
const ASSETS_PUBLIC_PATH = `/out/`;
const CLIENT_ENTRY_PATH = resolve(ROOT, 'client/index.ts');
// const SERVER_ENTRY_PATH = resolve(ROOT, 'server/index.ts');
const STYLE_ENTRY_PATH = resolve(ROOT, 'style/style.js');
const OUTPUT_DIR = resolve(ROOT, 'public/out');




module.exports = {
    context: ROOT,
    mode: 'development',
    entry: {
        client: CLIENT_ENTRY_PATH,
        style: STYLE_ENTRY_PATH,
    },

    output: {
        path: OUTPUT_DIR,
        publicPath: '/',
        filename: '[name].js',
    },

    resolve: {
        // alias: SDI_ALIAS,
        // proj4 module declaration is not consistent with its ditribution
        mainFields: ["browser", "main", /* "module" */],
        extensions: ['.ts', '.js'],
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    // { loader: 'babel-loader' },
                    { loader: 'ts-loader' },
                ],
            },


            /**
             * Style
             */
            // CSS
            {
                test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" }
                ],
            },

            // LESS
            {
                test: /\.less$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    { loader: "less-loader" }
                ],
            },

            //fonts
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    publicPath: ASSETS_PUBLIC_PATH
                }
            },

            //images
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'file-loader',
                options: {
                    publicPath: ASSETS_PUBLIC_PATH
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
};


