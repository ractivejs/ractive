/* eslint-env node */

const base = require('./base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: base.plugins.concat(['karma-coverage', 'karma-electron']),
		browsers: ['Electron'],
		reporters: base.reporters.concat(['coverage']),
		coverageReporter: {
			dir: './coverage/',
			subdir: 'electron',
			reporters: [
				{ type: 'html' },
				{ type: 'json' },
			]
		},
		preprocessors: {
			'tests-node.js': ['electron'],
		},
		files: [
			'ractive.js',
			'tests-node.js'
		],
		client: Object.assign({}, base.client, {
			useIframe: false
		})
	}));
};
