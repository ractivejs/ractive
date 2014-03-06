module.exports = function ( grunt ) {
	return {
		options: {
			process: true
		},
		all: {
			files: [{
				expand: true,
				cwd: 'tmp/',
				src: '*.js',
				dest: 'build/'
			}]
		}
	};
};
