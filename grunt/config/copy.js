module.exports = {
	release: {
		files: [{
			expand: true,
			cwd: 'build/',
			src: [ '**/*' ],
			dest: 'release/<%= pkg.version %>/'
		}]
	},
	link: {
		src: 'build/ractive.js',
		dest: 'ractive.js'
	}
};
