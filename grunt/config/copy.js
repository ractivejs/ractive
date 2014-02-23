module.exports = {
	release: {
		files: [{
			expand: true,
			cwd: 'build/',
			src: [ '**/*' ],
			dest: 'release/<%= pkg.version %>/'
		}]
	}
};