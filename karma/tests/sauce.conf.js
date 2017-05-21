/* eslint-env node */
/* eslint object-shorthand:0 */

const base = require('./base.conf');

const customLaunchers = {
	sl_chrome: {
		base: 'SauceLabs',
		browserName: 'chrome',
		platform: 'Windows 10',
		version: 'beta'
	},
	sl_firefox: {
		base: 'SauceLabs',
		browserName: 'firefox',
		platform: 'Windows 10'
	},
	sl_edge: {
		base: 'SauceLabs',
		browserName: 'MicrosoftEdge',
		platform: 'Windows 10'
	},
	sl_ie: {
		base: 'SauceLabs',
		browserName: 'internet explorer',
		platform: 'Windows 10'
	},
	sl_safari: {
		base: 'SauceLabs',
		browserName: 'safari',
		platform: 'OS X 10.11'
	}
};

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: base.plugins.concat(['karma-sauce-launcher']),
		browsers: Object.keys(customLaunchers),
		reporters: base.reporters.concat(['saucelabs']),
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
		},
		customLaunchers: customLaunchers,
		sauceLabs: {
			testName: 'Ractive.js Unit Tests',
			recordScreenshots: false,
		},
		captureTimeout: 300000,
		browserNoActivityTimeout: 300000
	}));
};
