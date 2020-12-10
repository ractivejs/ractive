import serve from 'rollup-plugin-serve';

import {
  BUILD_FOLDER,
  DEFAULT_ROLLUP_BUILD_PLUGINS,
  TestBundleManifest,
  cleanBuildFolder,
  getUMDConfiguration,
  processRollupOptions,
  getTestBrowserConfiguration,
  buildTestEntryPoint
} from './rollup.utils';

cleanBuildFolder();

buildTestEntryPoint(TestBundleManifest.BROWSER);

export default processRollupOptions([
  {
    ...getUMDConfiguration('ractive.js'),
    plugins: [
      ...DEFAULT_ROLLUP_BUILD_PLUGINS,

      serve({
        contentBase: [BUILD_FOLDER, 'sandbox'],
        port: 4567
      })
    ]
  },

  getTestBrowserConfiguration()
]);
