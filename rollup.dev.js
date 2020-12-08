import serve from 'rollup-plugin-serve';

import {
  BUILD_FOLDER,
  DEFAULT_ROLLUP_BUILD_PLUGINS,
  clean,
  getUMDConfiguration,
  processRollupOptions
} from './rollup.utils';

export default processRollupOptions({
  ...getUMDConfiguration('ractive.js'),
  plugins: [
    clean,

    ...DEFAULT_ROLLUP_BUILD_PLUGINS,

    serve({
      contentBase: [BUILD_FOLDER, 'sandbox'],
      port: 4567
    })
  ]
});
