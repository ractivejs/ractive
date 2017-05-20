/* eslint-env node */

module.exports = {
	basePath: '../.build/tests',
	plugins: ['karma-qunit', 'karma-failed-reporter'],
	frameworks: ['qunit'],
	reporters: ['failed'],
	customContextFile: '../../tests/context.html',
	client: {
		captureConsole: false,
		qunit: {
			reorder: false,
			testTimeout: 30000
		}
	},
	singleRun: true
};
