import { terser } from 'rollup-plugin-terser';

import {
  INPUT_FILE,
  DEFAULT_ROLLUP_BUILD_PLUGINS,
  PACKAGE_ADDITIONAL_FILES,
  getESConfiguration,
  getUMDConfiguration,
  clean,
  skipModule,
  banner,
  processRollupOptions
} from './rollup.utils';

const runtimeModulesToIgnore = ['parse/_parse.ts'];

const minify = terser({
  format: {
    preamble: banner
  }
});

export default processRollupOptions([
  /**
   * All in-one (batteries included!) compilation
   */
  {
    input: INPUT_FILE,
    output: [
      // esRegular
      getESConfiguration('ractive.mjs').output,

      // umdRegular
      getUMDConfiguration('ractive.js').output,

      // Minify
      {
        ...getUMDConfiguration('ractive.min.js').output,
        plugins: [minify]
      }
    ],
    cache: false,
    plugins: [clean, ...DEFAULT_ROLLUP_BUILD_PLUGINS, ...PACKAGE_ADDITIONAL_FILES]
  },

  /**
   * Runtime file compilation
   */
  {
    input: INPUT_FILE,
    output: [
      // esRuntime
      getESConfiguration('runtime.mjs').output,

      // umdRuntime
      getUMDConfiguration('runtime.js').output,

      {
        ...getUMDConfiguration('runtime.min.js').output,
        plugins: [minify]
      }
    ],
    cache: false,
    plugins: [...DEFAULT_ROLLUP_BUILD_PLUGINS, skipModule(runtimeModulesToIgnore)]
  }
]);
