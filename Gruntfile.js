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
			main: {
				files: 'src/**/*.js',
				tasks: 'concat',
				options: {
					interrupt: true
				}
			}
		},
		qunit: {
			files: [ 'test/core.html', 'test/parse.html', 'test/render.html' ]
		},
		clean: {
			files: [ 'build/**/*' ]
		},
		concat: {
			runtime: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: [ 'wrapper/begin.js', 'src/**/*.js', 'wrapper/end.js', '!src/_legacy.js', '!src/parser/**/*.js' ],
				dest: 'build/Ractive.runtime.js'
			},
			full: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: [ 'wrapper/begin.js', 'src/**/*.js', 'wrapper/end.js', '!src/_legacy.js'  ],
				dest: 'build/Ractive.js'
			},
			runtime_legacy: {
				src: [ 'src/_legacy.js', '<%= concat.runtime.dest %>' ],
				dest: 'build/Ractive-legacy.runtime.js'
			},
			full_legacy: {
				src: [ 'src/_legacy.js', '<%= concat.full.dest %>' ],
				dest: 'build/Ractive-legacy.js'
			}
		},
		watch: {
			files: ['<config:lint.files>', 'package.json'],
			tasks: ['concat','min']
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
	
	// Default task.
	grunt.registerTask('default', [ 'jshint', 'qunit', 'clean', 'concat' ]);

	grunt.registerTask( 'release', [ 'default', 'uglify', 'copy' ] );

};
