/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		meta: {
			banner: '/*! Ractive - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* <%= pkg.description %>\n\n' +
				'* <%= pkg.homepage %>\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n' +
				'\n' +
				'/*jslint eqeq: true, plusplus: true */\n' +
				'/*global document, HTMLElement */\n' +
				'\n\n'
		},
		watch: {
			js: {
				files: [ 'src/**/*.js', 'wrapper/**/*.js' ],
				tasks: [ 'clean:tmp', 'concat' ],
				options: {
					interrupt: true,
					force: true
				}
			}
		},
		qunit: {
			files: [ 'test/index.html' ]
		},
		concat: {
			options: {
				process: {
					data: { version: '<%= pkg.version %>' }
				}
			},
			runtime: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: [ 'wrapper/begin.js', 'src/**/utils/*.js', 'src/**/*.js', 'wrapper/end.js', '!src/legacy.js', '!src/parser/**/*.js' ],
				dest: 'tmp/Ractive.runtime.js'
			},
			full: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: [ 'wrapper/begin.js', 'src/**/utils/*.js', 'src/**/*.js', 'wrapper/end.js', '!src/legacy.js'  ],
				dest: 'tmp/Ractive.js'
			},
			runtime_legacy: {
				src: [ 'wrapper/begin.js', 'src/legacy.js', 'src/**/utils/*.js', 'src/**/*.js', 'wrapper/end.js', '!src/parser/**/*.js' ],
				dest: 'tmp/Ractive-legacy.runtime.js'
			},
			full_legacy: {
				src: [ 'wrapper/begin.js', 'src/legacy.js', 'src/**/utils/*.js', 'src/**/*.js', 'wrapper/end.js' ],
				dest: 'tmp/Ractive-legacy.js'
			}
		},
		clean: {
			tmp: [ 'tmp/' ],
			build: [ 'build/' ]
		},
		jshint: {
			files: [ '<%= concat.full_legacy.dest %>' ],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		uglify: {
			runtime: {
				src: ['<%= concat.runtime.dest %>'],
				dest: 'build/Ractive.runtime.min.js'
			},
			full: {
				src: ['<%= concat.full.dest %>'],
				dest: 'build/Ractive.min.js'
			},
			runtime_legacy: {
				src: ['<%= concat.runtime_legacy.dest %>'],
				dest: 'build/Ractive-legacy.runtime.min.js'
			},
			full_legacy: {
				src: ['<%= concat.full_legacy.dest %>'],
				dest: 'build/Ractive-legacy.min.js'
			}
		},
		copy: {
			build: {
				files: [{
					expand: true,
					cwd: 'tmp/',
					src: [ '**/*' ],
					dest: 'build/'
				}]
			},
			release: {
				files: [{
					expand: true,
					cwd: 'build/',
					src: [ '**/*' ],
					dest: 'release/<%= pkg.version %>/'
				}]
			},
			link: {
				files: {
					'Ractive.js': 'build/Ractive.js'
				}
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	
	grunt.registerTask( 'default', [
		'clean:tmp',
		'concat',
		'jshint',
		'qunit',
		'clean:build',
		'copy:build',
		'uglify'
	]);

	grunt.registerTask( 'release', [ 'default', 'copy:release', 'copy:link' ] );

};
