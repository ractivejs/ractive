/* eslint-env node */
/* eslint object-shorthand:0 no-console:0 */

const base = require('./karma.base.conf');

module.exports = function (config) {

	if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
		console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.')
		process.exit(1);
	}

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

	config.set(Object.assign({}, base, {
		plugins: ['karma-qunit', 'karma-sauce-launcher', 'karma-failed-reporter'],
		reporters: ['failed', 'saucelabs'],
		browsers: Object.keys(customLaunchers),
		customLaunchers: customLaunchers,
		sauceLabs: {
			testName: 'Ractive.js Unit Tests',
			recordScreenshots: false,
		},

		captureTimeout: 300000,
		browserNoActivityTimeout: 300000

	}));
};
