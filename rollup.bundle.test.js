import fs from 'fs';
import path from 'path';

import buble from '@rollup/plugin-buble';
import fsPlus from 'fs-plus';
import copy from 'rollup-plugin-copy';
import istanbul from 'rollup-plugin-istanbul';

import {
  BUILD_FOLDER,
  getUMDConfiguration,
  processRollupOptions,
  replacePlaceholders,
  compileTypescript,
  transpile
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

/**
 * @typedef {'BROWSER' | 'NODE'} TestGroup
 *
 * @typedef {Object} TestBundleConfig
 * @property {string} folder folder where test are stored (inside `./tests`)
 * @property {string} input the name of the file that will be used to create the bundle
 * @property {string} bundle the name of the bundle included inside Karma configuration
 */

/**
 * @type {Record<TestGroup, TestBundleConfig>}
 *
 * @todo consider to import these manifest inside karma config and use it inside `files` settings
 */
export const testBundleManifest = {
  BROWSER: {
    folder: 'browser',
    input: '_tests-browser-index.js',
    bundle: 'tests-browser.js'
  },
  NODE: {
    folder: 'node',
    input: '_tests-node-index.js',
    bundle: 'tests-node.js'
  }
};

// Manually create / clean build folder
fs.rmdirSync(BUILD_FOLDER, { recursive: true });
if (!fs.existsSync(BUILD_FOLDER)) {
  fs.mkdirSync(BUILD_FOLDER);
}

/**
 * Build test entry point file basically look inside test folder for all js files then create a
 * file which import and execute all test inside that folder
 *
 * @param {TestGroup} testGroup
 */
function buildTestEntryPoint(testGroup) {
  const { folder: testFolder, input: entryPoint } = testBundleManifest[testGroup];

  const testPaths = fsPlus
    .listTreeSync(`./tests/${testFolder}`)
    .filter(testPath => fsPlus.isFileSync(testPath) && path.extname(testPath) === '.js');

  const testImports = testPaths
    .map(
      (testPath, index) => `import test${index} from './${path.relative(BUILD_FOLDER, testPath)}';`
    )
    .join('\n');
  const testCalls = testPaths.map((_testPath, index) => `test${index}();`).join('\n');

  fs.writeFileSync(`${BUILD_FOLDER}/${entryPoint}`, `${testImports}\n${testCalls}`, 'utf8');
}

// Build entry point for each test group
Object.keys(testBundleManifest).forEach(testGroup => buildTestEntryPoint(testGroup));

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

  {
    input: `${BUILD_FOLDER}/${testBundleManifest.BROWSER.input}`,
    output: {
      name: 'RactiveBrowserTests',
      format: 'iife',
      file: `${BUILD_FOLDER}/${testBundleManifest.BROWSER.bundle}`,
      globals: {
        qunit: 'QUnit',
        simulant: 'simulant'
      },
      sourcemap: true
    },
    external: ['qunit', 'simulant'],
    plugins: [buble()],
    cache: false
  },

  {
    input: `${BUILD_FOLDER}/${testBundleManifest.NODE.input}`,
    output: {
      format: 'cjs',
      file: `${BUILD_FOLDER}/${testBundleManifest.NODE.bundle}`,
      sourcemap: true
    },
    external: ['cheerio'],
    cache: false,
    plugins: [
      buble(),

      copy({
        targets: [{ src: 'qunit/*', dest: `${BUILD_FOLDER}/qunit` }]
      })
    ]
  }
]);
