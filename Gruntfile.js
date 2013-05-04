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
				'\n\n',
			wrapper: {
				start: '(function ( global ) {\n\n' +
						'\'use strict\';\n\n',
				end: '\n\n// export\n' +
						'if ( typeof module !== "undefined" && module.exports ) module.exports = Ractive // Common JS\n' +
						'else if ( typeof define === "function" && define.amd ) define( function () { return Ractive } ) // AMD\n' +
						'else { global.Ractive = Ractive }\n\n' +
						'}( this ));'
			}
		},
		lint: {
			files: ['grunt.js', 'src/**/*.js'] // TODO add tests
		},
		qunit: {
			files: [ 'test/core.html', 'test/compile.html', 'test/render.html' ]
		},
		clean: {
			files: [ 'build/**/*' ]
		},
		concat: {
			runtime: {
				options: {
					banner: '<%= meta.banner %><%= meta.wrapper.start %>',
					footer: '<%= meta.wrapper.end %>'
				},
				src: [ 'src/Ractive.js', 'src/_internal.js', 'src/types.js', 'src/fragment_utils.js', 'src/events.js', 'src/define_event.js', 'src/formatters.js', 'src/dom_fragment.js', 'src/text_fragment.js', 'src/extend.js', 'src/modify_array.js', 'src/easing.js', 'src/animate.js', 'src/interpolators.js', 'src/namespaces.js' ],
				dest: 'build/Ractive.runtime.js'
			},
			full: {
				options: {
					banner: '<%= meta.banner %><%= meta.wrapper.start %>',
					footer: '<%= meta.wrapper.end %>'
				},
				src: [ 'src/Ractive.js', 'src/_internal.js', 'src/types.js', 'src/fragment_utils.js', 'src/events.js', 'src/define_event.js', 'src/compile.js', 'src/tokenize.js', 'src/formatters.js', 'src/dom_fragment.js', 'src/text_fragment.js', 'src/extend.js', 'src/modify_array.js', 'src/easing.js', 'src/animate.js', 'src/interpolators.js', 'src/namespaces.js' ],
				dest: 'build/Ractive.js'
			},
			runtime_legacy: {
				src: [ 'src/legacy.js', '<%= concat.runtime.dest %>' ],
				dest: 'build/Ractive-legacy.runtime.js'
			},
			full_legacy: {
				src: [ 'src/legacy.js', '<%= concat.full.dest %>' ],
				dest: 'build/Ractive-legacy.js'
			}
		},
		watch: {
			files: ['<config:lint.files>', 'package.json'],
			tasks: ['concat','min']
		},
		jshint: {
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
	
	// Default task.
	grunt.registerTask('default', [ 'jshint', 'qunit', 'clean', 'concat', 'uglify' ]);

	grunt.registerTask( 'release', [ 'default', 'copy' ] );

};
