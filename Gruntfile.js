/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* <%= pkg.homepage %>\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n' +
				'\n' +
				'/*jslint eqeq: true, plusplus: true */\n' +
				'/*global document, HTMLElement */\n' +
				'\n\n',
			wrapper: {
				start: '(function ( global ) {\n\n' +
						'"use strict";',
				end: '\n\n// export\n' +
						'if ( typeof module !== "undefined" && module.exports ) module.exports = Anglebars // Common JS\n' +
						'else if ( typeof define === "function" && define.amd ) define( function () { return Anglebars } ) // AMD\n' +
						'else { global.Anglebars = Anglebars }\n\n' +
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
			files: [ 'build/**/*.js' ]
		},
		concat: {
			options: {
				banner: '<%= meta.banner %><%= meta.wrapper.start %>',
				footer: '<%= meta.wrapper.end %>'
			},
			compile: {
				src: [ 'src/compile.js', 'src/tokenize.js', 'src/types.js' ],
				dest: 'build/compile/Anglebars.compile.js'
			},
			runtime: {
				src: [ 'src/Anglebars.js', 'src/types.js', 'src/events.js', 'src/formatters.js', 'src/ViewModel.js', 'src/DomViews.js', 'src/TextViews.js', 'src/extend.js', 'src/modifyArray.js' ],
				dest: 'build/runtime/Anglebars.runtime.js'
			},
			full: {
				src: [ 'src/Anglebars.js', 'src/types.js', 'src/events.js', 'src/compile.js', 'src/tokenize.js', 'src/formatters.js', 'src/ViewModel.js', 'src/DomViews.js', 'src/TextViews.js', 'src/extend.js', 'src/modifyArray.js' ],
				dest: 'build/Anglebars.js'
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
			compile: {
				src: ['<%= concat.compile.dest %>'],
				dest: 'build/compile/Anglebars.compile.min.js'
			},
			runtime: {
				src: ['<%= concat.runtime.dest %>'],
				dest: 'build/runtime/Anglebars.runtime.min.js'
			},
			full: {
				src: ['<%= concat.full.dest %>'],
				dest: 'build/Anglebars.min.js'
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
				files:{
					'Anglebars.js': 'build/Anglebars.js',
					'Anglebars.compile.js': 'build/compile/Anglebars.compile.js',
					'Anglebars.runtime.js': 'build/runtime/Anglebars.runtime.js'
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
