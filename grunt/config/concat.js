module.exports = function ( grunt) {

	var intro = grunt.file.read( 'wrapper/intro.js' ),
		outro = grunt.file.read( 'wrapper/outro.js' ),
		banner = grunt.file.read( 'wrapper/banner.js' );

	return {
		closure: {
			files: [{
				expand: true,
				cwd: '<%= tmpDir %>/',
				src: '*.js',
				dest: '<%= tmpDir %>/'
			}],
			options: {
				banner: intro,
				footer: outro
			}
		},
		banner: {
			files: [{
				expand: true,
				cwd: '<%= tmpDir %>/',
				src: '*.js',
				dest: 'build/'
			}],
			options: {
				process: function(src, filepath) {
		        	grunt.config('filepath', require('path').basename(filepath))
		        	return grunt.template.process(banner + src);
		        }
			}
		}
	};
};
