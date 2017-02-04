/* eslint-env node */

const base = require('./karma.base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: ['karma-qunit', 'karma-phantomjs-launcher', 'karma-failed-reporter', 'karma-coverage', 'karma-coveralls'],
		browsers: ['PhantomJS'],
		reporters: ['failed', 'coverage', 'coveralls'],

		preprocessors: {
			'../ractive.js': ['coverage']
		},

		coverageReporter: {
			dir: 'coverage/',
			type: 'lcov'
		}
	}));
};
