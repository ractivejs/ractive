import {
  INPUT_FILE,
  DEFAULT_ROLLUP_BUILD_PLUGINS,
  PACKAGE_ADDITIONAL_FILES,
  getESConfiguration,
  getUMDConfiguration,
  cleanBuildFolder,
  processRollupOptions
} from './rollup.utils';

cleanBuildFolder();

const esOutPut = getESConfiguration('ractive.mjs').output;
const umdOutput = getUMDConfiguration('ractive.js').output;

export default processRollupOptions({
  input: INPUT_FILE,
  output: [esOutPut, umdOutput],
  cache: false,
  plugins: [...DEFAULT_ROLLUP_BUILD_PLUGINS, ...PACKAGE_ADDITIONAL_FILES]
});
