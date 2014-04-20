module.exports = function ( grunt) {

	return {
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
		        process: function(src, filepath) {
		        	grunt.config('filepath', require('path').basename(filepath))
		        	return grunt.template.process(grunt.config('banner') + src);
		        }
			}
		}
	};
	
}
