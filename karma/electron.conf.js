/* eslint-env node */

const base = require('./base.conf');

module.exports = function (config) {
  config.set({
    ...base,
    plugins: [...base.plugins, 'karma-coverage', 'karma-electron'],
    browsers: ['Electron'],
    reporters: [...base.reporters, 'coverage'],
    coverageReporter: {
      dir: './coverage/',
      subdir: 'electron',
      reporters: [{ type: 'html' }, { type: 'json' }]
    },
    preprocessors: {
      'tests-node.js': ['electron']
    },
    files: ['ractive.js', 'tests-node.js'],
    client: {
      ...base.client,
      useIframe: false
    }
  });
};
