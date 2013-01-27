/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n' +
				'\n' +
				'/*jslint eqeq: true, plusplus: true */\n' +
				'/*global document, HTMLElement */\n' +
				'\n' +
				'\'use strict\';\n\n',
			wrapper: {
				start: '(function ( global ) {',
				end: '\n// export\n' +
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
			dist: {
				src: ['<banner:meta.banner>', '<banner:meta.wrapper.start>', 'src/Anglebars.js', 'src/tokenize.js', 'src/compile.js', 'src/ViewModel.js', 'src/DomViews.js', 'src/TextViews.js', '<banner:meta.wrapper.end>' ],
				dest: 'build/<%= pkg.name %>.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		watch: {
			files: ['<config:lint.files>', 'package.json'],
			tasks: ['concat','min']
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				nomen: false,
				white: false
			},
			globals: {
				console: true
			}
		},
		uglify: {}
	});

	// Default task.
	grunt.registerTask('default', 'lint qunit concat min');

};
