/* eslint-env node */

module.exports = {
	basePath: '../../.build',
	plugins: ['karma-benchmark', 'karma-benchmark-reporter'],
	frameworks: ['benchmark'],
	reporters: ['benchmark'],
	singleRun: true,
	customContextFile: '../karma/benchmarks/context.html',
	client: {
		captureConsole: false,
	},
	files: [
		'ractive.js',
		'benchmarks/*.js'
	]
};
