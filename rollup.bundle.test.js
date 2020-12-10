import istanbul from 'rollup-plugin-istanbul';

import {
  getUMDConfiguration,
  processRollupOptions,
  replacePlaceholders,
  compileTypescript,
  transpile,
  TestBundleManifest,
  buildTestEntryPoint,
  getTestBrowserConfiguration,
  getTestNodeConfiguration,
  cleanBuildFolder
} from './rollup.utils';

/**
 * TEST BUNDLE PROCESS STEPS
 * 1. clean up the build folder manually. (we can't use rollup plugin because we are creating some
 *    file in the folder before rollup execution)
 *
 * 2. Build test entry points that will be used by rollup to create tests bundle used by Karma
 *
 * 3. Build ractive UMD
 *
 * 4. Build bundles for browser and node tests using entry points created in step 2
 *
 * 5. Copy `quinit` folder content inside build folder
 */

cleanBuildFolder();

// Build entry point for each test group
Object.values(TestBundleManifest).forEach(buildTestEntryPoint);

export default processRollupOptions([
  // Bundle build
  {
    ...getUMDConfiguration('ractive.js'),
    plugins: [
      replacePlaceholders,

      compileTypescript,

      // This needs to be here otherwise we get the a istanbul error:
      // https://github.com/gotwarlost/istanbul/issues/602
      istanbul({
        exclude: ['src/polyfills/*.js']
      }),

      transpile
    ]
  },

  getTestBrowserConfiguration(),

  getTestNodeConfiguration()
]);
