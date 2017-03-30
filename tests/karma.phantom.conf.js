/* eslint-env node */

const base = require('./karma.base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: base.plugins.concat(['karma-coverage', 'karma-phantomjs-launcher']),
		browsers: ['PhantomJS'],
		reporters: base.reporters.concat(['coverage']),
		coverageReporter: {
			dir: '../coverage/',
			reporters: [
				{ type: 'html' },
				{ type: 'json' },
			]
		},
		preprocessors: {
			'../ractive.js': ['coverage']
		},
		files: [
			'files/qunit-html.js',
			'files/simulant.js',
			'../polyfills.js',
			'../ractive.js',
			'browser.js',
			{ pattern: 'files/*.gif', served: true, included: false, watched: false, nocache: false },
		],
		proxies: {
			'/files/': '/base/files/'
		}
	}));
};
