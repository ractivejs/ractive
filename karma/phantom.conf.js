/* eslint-env node */

const base = require('./base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: base.plugins.concat(['karma-coverage', 'karma-phantomjs-launcher']),
		browsers: ['PhantomJS'],
		reporters: base.reporters.concat(['coverage']),
		coverageReporter: {
			dir: './coverage/',
			reporters: [
				{ type: 'html' },
				{ type: 'json' },
			]
		},
		preprocessors: {
			'ractive.js': ['coverage']
		},
		files: [
			'qunit/qunit-html.js',
			'qunit/simulant.js',
			'polyfills.js',
			'ractive.js',
			'tests-browser.js',
			{ pattern: 'qunit/*.gif', served: true, included: false, watched: false, nocache: false },
		],
		proxies: {
			'/qunit/': '/base/qunit/'
		}
	}));
};
