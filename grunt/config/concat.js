module.exports = function ( grunt ) {
	return {
		options: {
			banner: grunt.file.read( 'wrapper/banner.js' ),
			footer: grunt.file.read( 'wrapper/footer.js' ),
			process: {
				data: { version: '<%= pkg.version %>' }
			}
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