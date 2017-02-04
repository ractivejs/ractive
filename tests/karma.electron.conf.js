/* eslint-env node */

const base = require('./karma.base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: ['karma-qunit', 'karma-electron', 'karma-failed-reporter'],
		browsers: ['Electron'],
		reporters: ['failed'],
		preprocessors: {
			'**/*.js': ['electron']
		},
		client: Object.assign({}, base.client, {
			useIframe: false
		}),
		files: [
			'../ractive.js',
			'node.js'
		]
	}));
};
