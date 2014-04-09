module.exports = {
	js: {
		files: [ 'src/**/*.js', 'wrapper/**/*.js' ],
		tasks: [ 'clean:tmp', 'requirejs' ],
		options: {
			interrupt: true,
			force: true
		}
	}
};