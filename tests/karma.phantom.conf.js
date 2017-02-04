/* eslint-env node */

const base = require('./karma.base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: ['karma-qunit', 'karma-phantomjs-launcher', 'karma-failed-reporter'],
		browsers: ['PhantomJS'],
		reporters: ['failed']
	}));
};
