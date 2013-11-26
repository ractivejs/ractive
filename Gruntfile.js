/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		
		pkg: grunt.file.readJSON( 'package.json' ),
		
		watch: {
			js: {
				files: [ 'src/**/*.js', 'wrapper/**/*.js' ],
				tasks: [ 'clean:tmp', 'requirejs' ],
				options: {
					interrupt: true,
					force: true
				}
			}
		},

		nodeunit: {
			basic: [ 'test/node/basic.js' ],
			parse: [ 'test/node/parse.js' ],
			renderHTML: [ 'test/node/renderHTML.js' ]
		},
		
		qunit: {
			parse:    [ 'test/build/parse.html'    ],
			render:   [ 'test/build/render.html'   ],
			mustache: [ 'test/build/mustache.html' ],
			events:   [ 'test/build/events.html'   ],
			misc:     [ 'test/build/misc.html'     ],
			merge:    [ 'test/build/merge.html'    ],
			observe:  [ 'test/build/observe.html'  ],
			options: {
				timeout: 30000
			}
		},

		requirejs: {
			full: {
				options: {
					baseUrl: 'src/',
					name: 'Ractive',
					out: 'tmp/Ractive.js',
					optimize: 'none',
					findNestedDependencies: true,
					onBuildWrite: function( name, path, contents ) {
						return require( 'amdclean' ).clean( contents );
					},

					wrap: {
						startFile: 'wrapper/intro.js',
						endFile: 'wrapper/outro.js'
					}
				}
			},
			runtime: {
				options: {
					baseUrl: 'src/',
					name: 'Ractive',
					out: 'tmp/Ractive.runtime.js',
					optimize: 'none',
					findNestedDependencies: true,
					onBuildWrite: function( name, path, contents ) {
						return require( 'amdclean' ).clean( contents );
					},

					paths: {
						'parse/_parse': 'empty:'
					},

					wrap: {
						startFile: 'wrapper/intro.js',
						endFile: 'wrapper/outro.js'
					}
				}
			}
		},
		
		concat: {
			options: {
				banner: grunt.file.read( 'wrapper/banner.js' ),
				process: {
					data: { version: '<%= pkg.version %>' }
				}
			},
			full: {
				src: [ 'tmp/Ractive.js'  ],
				dest: 'build/Ractive.js'
			},
			runtime: {
				src: [ 'tmp/Ractive.runtime.js'  ],
				dest: 'build/Ractive.runtime.js'
			},
			full_legacy: {
				src: [ 'src/legacy.js', 'tmp/Ractive.js'  ],
				dest: 'build/Ractive-legacy.js'
			},
			runtime_legacy: {
				src: [ 'src/legacy.js', 'tmp/Ractive.runtime.js'  ],
				dest: 'build/Ractive-legacy.runtime.js'
			}
		},
		
		clean: {
			tmp: [ 'tmp/' ],
			build: [ 'build/' ]
		},
		
		jshint: {
			files: [ 'src/**/*.js' ],
			options: {
				proto: true,
				smarttabs: true,
				boss: true,
				evil: true,
				laxbreak: true,
				undef: true,
				unused: true,
				'-W018': true,
				eqnull: true,
				strict: true,
				globals: {
					define: true,
					require: true,
					Element: true,
					window: true,
					setTimeout: true,
					setInterval: true,
					clearInterval: true,
					module: true,
					document: true,
					loadCircularDependency: true
				}
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
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
	
	grunt.registerTask( 'default', [
		'test',
		'clean:build',
		'concat',
		'uglify'
	]);

	grunt.registerTask( 'test', [
		'clean:tmp',
		'jshint',
		'requirejs',
		'nodeunit',
		'qunit'
	]);

	grunt.registerTask( 'release', [ 'default', 'copy:release', 'copy:link' ] );

};
