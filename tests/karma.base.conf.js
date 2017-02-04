/* eslint-env node */

module.exports = {
	basePath: '../.build/tests',
	frameworks: ['qunit'],
	singleRun: true,
	client: {
		captureConsole: false,
		qunit: {
			reorder: false,
			testTimeout: 30000
		}
	},
	files: [
		'files/qunit-html.js',
		'files/simulant.js',
		'../polyfills.js',
		'../ractive.js',
		'files/init.js',
		'browser.js',
		{ pattern: 'files/*.gif', served: true, included: false, watched: false, nocache: false },
	],
	proxies: {
		'/files/': '/base/files/'
	}
};
