module.exports = {
	transpile: {
		files: [ 'es6/**/*.js' ],
		tasks: 'transpile'
	},
	js: {
		files: [ 'src/**/*.js', 'wrapper/**/*.js' ],
		tasks: [ 'clean:tmp', 'requirejs' ],
		options: {
			interrupt: true,
			force: true
		}
	}
};
