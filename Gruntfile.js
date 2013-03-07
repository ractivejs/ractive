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
			files: ['test/**/*.html']
		},
		concat: {
			options: {
				banner: '<%= meta.banner %><%= meta.wrapper.start %>',
				footer: '<%= meta.wrapper.end %>'
			},
			dist: {
				src: [ 'src/Anglebars.js', 'src/tokenize.js', 'src/compile.js', 'src/ViewModel.js', 'src/DomViews.js', 'src/TextViews.js' ],
				dest: 'build/<%= pkg.name %>.js'
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
			dist: {
				src: ['<%= concat.dist.dest %>'],
				dest: 'build/<%= pkg.name %>.min.js'
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	
	// Default task.
	grunt.registerTask('default', [ 'jshint', 'qunit', 'concat', 'uglify' ]);

};
