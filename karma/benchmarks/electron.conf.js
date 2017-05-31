/* eslint-env node */
const base = require('./base.conf');

module.exports = function (config) {
	config.set(Object.assign({}, base, {
		plugins: base.plugins.concat['karma-electron'],
		browsers: ['Electron'],
	}));
};
