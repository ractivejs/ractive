/* eslint-env node */
import fs from 'fs';
import path from 'path';

import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import fsPlus from 'fs-plus';
import MagicString from 'magic-string';
import copy from 'rollup-plugin-copy';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

const time = new Date();
const commitHash = process.env.COMMIT_HASH || 'unknown';
const version = pkg.version;

const placeholders = {
  BUILD_PLACEHOLDER_VERSION: version
};

// File input and file destination configuration
export const INPUT_FILE = './src/Ractive.ts';
export const BUILD_FOLDER = './.build';

export const banner = `/*
	Ractive.js v${version}
	Build: ${commitHash}
	Date: ${time}
	Website: https://ractive.js.org
	License: MIT
*/`;

/** Invoke this function to add default params. Accepts both array and object param */
export function processRollupOptions(options) {
  let _options = options;
  if (!Array.isArray(_options)) _options = [_options];

  _options.forEach(opt => {
    opt.onwarn = function (msg, warn) {
      if (msg.code === 'CIRCULAR_DEPENDENCY') return;
      warn(msg);
    };
  });

  return _options;
}

export function cleanBuildFolder() {
  // Manually create / clean build folder
  fs.rmdirSync(BUILD_FOLDER, { recursive: true });
  if (!fs.existsSync(BUILD_FOLDER)) {
    fs.mkdirSync(BUILD_FOLDER);
  }
}

/*
 * Output configurations for Ractive bundle
 * ==============================
 */

export function getUMDConfiguration(outputFile) {
  return {
    input: INPUT_FILE,
    output: {
      name: 'Ractive',
      format: 'umd',
      file: `${BUILD_FOLDER}/${outputFile}`,
      banner,
      sourcemap: true,
      noConflict: true
    },
    cache: false
  };
}

export function getESConfiguration(outputFile) {
  return {
    input: INPUT_FILE,
    output: {
      format: 'es',
      file: `${BUILD_FOLDER}/${outputFile}`,
      sourcemap: true,
      banner
    },
    cache: false
  };
}

/*
 * Rollup plugins
 * ==============================
 */

// Replaces a modules content with a null export to omit module contents.
export function skipModule(excludedModules) {
  return {
    name: 'skipModule',
    transform(src, modulePath) {
      const moduleRelativePath = path
        .relative(path.join(__dirname, 'src'), modulePath)
        .split(path.sep)
        .join('/');
      const isModuleExcluded = excludedModules.indexOf(moduleRelativePath) > -1;

      const source = new MagicString(src);
      const sourceLength = src.length;

      const transformCode = isModuleExcluded
        ? source.overwrite(0, sourceLength, 'export default null;')
        : source;
      const transformMap = transformCode.generateMap({ hires: true });

      return { code: transformCode.toString(), map: transformMap.toString() };
    }
  };
}

/*
 * Rollup plugins setup
 * ==============================
 */
/** Clean build folder before start any bundle operation */
// export const cleanBuildFolder = del({
//   targets: `${BUILD_FOLDER}/*`,
//   runOnce: true
// });

export const replacePlaceholders = replace({
  /** @see https://github.com/rollup/plugins/tree/master/packages/replace#word-boundaries */
  delimiters: ['', ''],
  ...placeholders
});

export const compileTypescript = typescript();

export const transpile = buble();

/** List of the plugins needed to compile Ractive correctly */
export const DEFAULT_ROLLUP_BUILD_PLUGINS = [replacePlaceholders, compileTypescript, transpile];

export const typings = copy({
  targets: [{ src: 'typings/*', dest: `${BUILD_FOLDER}/typings` }]
});

export const bin = copy({
  targets: [{ src: 'bin/*.js', dest: `${BUILD_FOLDER}/bin` }]
});
export const lib = copy({
  targets: [{ src: 'lib/*.js', dest: `${BUILD_FOLDER}/lib` }]
});

export const manifests = copy({
  targets: [
    {
      src: 'manifests/*.json',
      dest: `${BUILD_FOLDER}`,
      transform(contents) {
        return Object.keys(placeholders).reduce((out, placeholder) => {
          return out.replace(new RegExp(`${placeholder}`, 'g'), placeholders[placeholder]);
        }, contents.toString());
      }
    }
  ]
});

/** Includes task to copy all non compiled files to the build folder */
export const PACKAGE_ADDITIONAL_FILES = [typings, bin, lib, manifests];

/*
 * Test utilities
 * - Rollup configurations
 * - Functions to build entry point
 * ==============================
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
 * @type {Readonly<Record<TestGroup, TestBundleConfig>>}
 *
 * @todo consider to import these manifest inside karma config and use it inside `files` settings
 */
export const TestBundleManifest = {
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

/**
 * Build test entry point file basically look inside test folder for all js files then create a
 * file which import and execute all test inside that folder
 *
 * @param {TestBundleConfig} testBundleConfig
 */
export function buildTestEntryPoint(testBundleConfig) {
  const { folder: testFolder, input: entryPoint } = testBundleConfig;

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

export function getTestBrowserConfiguration() {
  return {
    input: `${BUILD_FOLDER}/${TestBundleManifest.BROWSER.input}`,
    output: {
      name: 'RactiveBrowserTests',
      format: 'iife',
      file: `${BUILD_FOLDER}/${TestBundleManifest.BROWSER.bundle}`,
      globals: {
        qunit: 'QUnit',
        simulant: 'simulant'
      },
      sourcemap: true
    },
    external: ['qunit', 'simulant'],
    plugins: [
      buble(),

      copy({
        targets: [{ src: 'qunit/*', dest: `${BUILD_FOLDER}/qunit` }]
      })
    ],
    cache: false
  };
}

export function getTestNodeConfiguration() {
  return {
    input: `${BUILD_FOLDER}/${TestBundleManifest.NODE.input}`,
    output: {
      format: 'cjs',
      file: `${BUILD_FOLDER}/${TestBundleManifest.NODE.bundle}`,
      sourcemap: true
    },
    external: ['cheerio'],
    cache: false,
    plugins: [buble()]
  };
}
