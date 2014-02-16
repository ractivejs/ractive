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
			basic:  [ 'test/node/basic.js' ],
			parse:  [ 'test/node/parse.js' ],
			toHTML: [ 'test/node/toHTML.js' ]
		},

		qunit: {
			all:        [ 'test/tests/index.html'      ],
			parse:      [ 'test/tests/parse.html'      ],
			render:     [ 'test/tests/render.html'     ],
			mustache:   [ 'test/tests/mustache.html'   ],
			events:     [ 'test/tests/events.html'     ],
			misc:       [ 'test/tests/misc.html'       ],
			components: [ 'test/tests/components.html' ],
			merge:      [ 'test/tests/merge.html'      ],
			observe:    [ 'test/tests/observe.html'    ],
			find:       [ 'test/tests/find.html'       ],
			arrays:     [ 'test/tests/arrays.html'     ],
			options: {
				timeout: 30000
			}
		},

		requirejs: {
			full: {
				options: {
					out: 'tmp/Ractive.js',
					paths: {
						'legacy': 'empty/legacy'
					}
				}
			},
			legacy: {
				options: {
					out: 'tmp/Ractive-legacy.js'
				}
			},
			runtime: {
				options: {
					out: 'tmp/Ractive.runtime.js',
					paths: {
						'parse/_parse': 'empty/parse',
						'legacy': 'empty/legacy'
					}
				}
			},
			runtime_legacy: {
				options: {
					out: 'tmp/Ractive-legacy.runtime.js',
					paths: {
						'parse/_parse': 'empty/parse'
					}
				}
			},
			options: {
				baseUrl: 'src/',
				name: 'Ractive',
				optimize: 'none',
				logLevel: 2,
				onBuildWrite: function( name, path, contents ) {
					return require( 'amdclean' ).clean( contents ) + '\n';
				},
				wrap: {
					endFile: 'wrapper/export.js'
				}
			}
		},

		concat: {
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
		},

		clean: {
			tmp: [ 'tmp/' ],
			build: [ 'build/' ]
		},

		jshint: {
			files: [ 'src/**/*.js' ],
			options: {
				boss: true,
				eqnull: true,
				evil: true,
				laxbreak: true,
				proto: true,
				smarttabs: true,
				strict: true,
				undef: true,
				unused: true,
				'-W018': true,
				'-W041': false,
				globals: {
					clearInterval: true,
					define: true,
					document: true,
					Element: true,
					loadCircularDependency: true,
					module: true,
					require: true,
					setInterval: true,
					setTimeout: true,
					window: true
				}
			}
		},

		jsbeautifier: {
			files: 'build/**',
			options: {
				js: {
					indentWithTabs: true,
					spaceBeforeConditional: true,
					spaceInParen: true
				}
			}
		},

		uglify: {
			'build/Ractive.min.js': 'build/Ractive.js',
			'build/Ractive-legacy.min.js': 'build/Ractive-legacy.js',
			'build/Ractive.runtime.min.js': 'build/Ractive.runtime.js',
			'build/Ractive-legacy.runtime.min.js': 'build/Ractive-legacy.runtime.js'
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
	grunt.loadNpmTasks('grunt-jsbeautifier');

	grunt.registerTask( 'promises-aplus-tests', 'Run the Promises/A+ test suite.', function () {
		var promisesAplusTests, adaptor, done;

		promisesAplusTests = require( 'promises-aplus-tests' );
		adaptor = require( './test/promises-aplus-adaptor' );

		done = this.async();

		promisesAplusTests( adaptor, { reporter: 'dot' }, done );
	});

	grunt.registerTask( 'default', [
		'test',
		'clean:build',
		'concat',
		'jsbeautifier',
		'uglify',
		'copy:link'
	]);

	grunt.registerTask( 'test', [
		'clean:tmp',
		'jshint',
		'requirejs',
		'nodeunit',
		'qunit:all',
		//'promises-aplus-tests'
	]);

	grunt.registerTask( 'release', [ 'default', 'copy:release', 'copy:link' ] );

};
