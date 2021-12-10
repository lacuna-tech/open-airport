/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
/**
 * ALlows us to edit create-react-app configuration
 * without ejecting.
 */
const { getLoader, loaderByName } = require('@craco/craco')

const uiCommonDir = path.resolve(__dirname, '../ui-common')
const agencyConfigdir = path.resolve(__dirname, '../agency-config/src')
const srcDir = path.resolve(__dirname, './src')

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // https://medium.com/frontend-digest/using-create-react-app-in-a-monorepo-a4e6f25be7aa
      const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'))
      if (isFound) {
        match.loader.include = [srcDir, uiCommonDir, agencyConfigdir]
      }
      return {
        ...webpackConfig
        /**
         * Optionally, other webpack configuration details.
         */
        // optimization: {
        //   splitChunks: {
        //   },
        // },
      }
    }
  }
}
