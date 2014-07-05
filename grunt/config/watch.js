module.exports = {
	transpile: {
		files: [ 'src/**/*.js' ],
		tasks: [ 'transpile', 'copy:transpiled' ]
	},
	build: {
		files: [ 'src/**/*.js', 'wrapper/**/*.js' ],
		tasks: [ 'clean:tmp', 'requirejs' ],
		options: {
			interrupt: true,
			force: true
		}
	}
};
