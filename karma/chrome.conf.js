/* eslint-env node */
process.env.CHROME_BIN = require('puppeteer').executablePath()
const base = require('./base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: base.plugins.concat(['karma-coverage', 'karma-chrome-launcher']),
		browsers: ['ChromeHeadlessNoSandbox'],
		reporters: base.reporters.concat(['coverage']),
		coverageReporter: {
			dir: './coverage/',
			subdir: 'chrome',
			reporters: [
				{ type: 'html' },
				{ type: 'json' },
			]
		},
		files: [
			'qunit/qunit-html.js',
			'qunit/simulant.js',
			'ractive.js',
			'tests-browser.js',
			{ pattern: 'qunit/*.gif', served: true, included: false, watched: false, nocache: false },
		],
		proxies: {
			'/qunit/': '/base/qunit/'
		},
		customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
	}));
};
