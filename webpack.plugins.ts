import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack = require('webpack');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
    new ForkTsCheckerWebpackPlugin({
        logger: 'webpack-infrastructure',
    }),
    new webpack.DefinePlugin({
        'ZAIM_CONSUMER_KEY': JSON.stringify(process.env.ZAIM_CONSUMER_KEY),
        'ZAIM_CONSUMER_SECRET': JSON.stringify(process.env.ZAIM_CONSUMER_SECRET),
    })
];
