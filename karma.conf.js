// Karma configuration
// Generated on Sat Apr 02 2016 15:10:31 GMT+0200 (Západoeurópsky čas (letný))

module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: 'tmp',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [ 'qunit' ],

		// list of files / patterns to load in the browser
		files: [
			'test/es6-shim.js',
			'ractive.js',
			'test/qunit-html.js',
			'test/simulant.js',
			'test/karma-init.js',
			'test/**/*js'
		],

		// list of files to exclude
		exclude: [
			'test/node-tests/**',
			'test/utils/**',
			'test/blanket.js',
			'test/qunit.js',
			'test/qunit-tap.js'
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'*.js': [ 'coverage' ]
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: [ 'progress', 'coverage' ],

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: [ 'PhantomJS' ],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// client config
		client: {
			qunit: {
				reorder: false,
				testTimeout: 5000
			}
		},

		// generate output for coveralls
		coverageReporter: {
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'lcovonly', subdir: '.', file: 'lcov.info' }
			]
		}
	});
};
