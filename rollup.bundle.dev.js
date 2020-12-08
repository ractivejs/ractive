import {
  INPUT_FILE,
  DEFAULT_ROLLUP_BUILD_PLUGINS,
  PACKAGE_ADDITIONAL_FILES,
  getESConfiguration,
  getUMDConfiguration,
  clean,
  processRollupOptions
} from './rollup.utils';

const esOutPut = getESConfiguration('ractive.mjs').output;
const umdOutput = getUMDConfiguration('ractive.js').output;

export default processRollupOptions({
  input: INPUT_FILE,
  output: [esOutPut, umdOutput],
  cache: false,
  plugins: [clean, ...DEFAULT_ROLLUP_BUILD_PLUGINS, ...PACKAGE_ADDITIONAL_FILES]
});
