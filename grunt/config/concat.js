module.exports = {
	closure: {
		files: [{
			expand: true,
			cwd: 'tmp/',
			src: '*.js',
			dest: 'tmp/'
		}],
		options: {
			banner: '<%= intro %>',
			footer: '<%= outro %>'
		}
	},
	banner: {
		files: [{
			expand: true,
			cwd: 'tmp/',
			src: '*.js',
			dest: 'build/'
		}],
		options: {
			process: true,
			banner: '<%= banner %>'
		}
	}
};
