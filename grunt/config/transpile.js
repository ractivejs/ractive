module.exports = {
	main: {
		type: 'amd',
		files: [{
			expand: true,
			cwd: 'src/',
			src: '**/*.js',
			dest: '.transpiled'
		}]
	}
};
