/* eslint-env node */
import path from 'path';

import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import MagicString from 'magic-string';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
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
export const BUILD_FOLDER = './.buildRollup';

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

/*
 * Output configurations
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

/** List of the plugins needed to compile Ractive correctly */
export const DEFAULT_ROLLUP_BUILD_PLUGINS = [
  replace({
    /** @see https://github.com/rollup/plugins/tree/master/packages/replace#word-boundaries */
    delimiters: ['', ''],
    ...placeholders
  }),

  typescript(),

  buble()
];

/** Clean build folder before start any bundle operation */
export const clean = del({
  targets: `${BUILD_FOLDER}/*`,
  runOnce: true
});

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
      dest: `${BUILD_FOLDER}/manifests`,
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
