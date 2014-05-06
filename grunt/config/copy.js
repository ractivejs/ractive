module.exports = function ( grunt) {

	var path = require('path'),
		testDir = 'test/',
		testsDir = testDir + 'tests/',
		moduleDir = testDir + 'modules/',
		templateDir = testDir + 'test-templates/',
		runTestsjs = grunt.file.read( templateDir + 'runTests.js' ),
		moduleTemplate = grunt.file.read( templateDir + 'module.html' )

	function setLevels(filepath){
    	var levels = path.relative( path.resolve( filepath ), path.resolve( testDir ) );
		levels = levels.substring( 0, levels.length-2 );
    	grunt.config( 'levels', levels );
	}

	return {
		release: {
			files: [{
				expand: true,
				cwd: 'build/',
				src: [ '**/*' ],
				dest: 'release/<%= pkg.version %>/'
			}]
		},
		link: {
			src: 'build/ractive.js',
			dest: 'ractive.js'
		},
		transpiled: {
			files: [{
				expand: true,
				cwd: '.transpiled/',
				src: [ '**/*' ],
				dest: '.amd'
			}],
			options: {
				process: function ( src ) {
					var dependencies = {};

					src = src

						// anonymise the module
						.replace( /^define\(".+?",\s+/, 'define(' )

						// remove "exports" from dependency list
						.replace( /,?"exports"/, '' )

						// remove empty dependency lists
						.replace( /^define\(\[\],\s+/, 'define(' )

						// gather dependency names
						.replace( /\svar (.+?) = __dependency(\d+)__\["default"\];\n/g, function ( match, name, num ) {
							dependencies[ num ] = name;
							return '';
						})

						// replace dependency names
						.replace( /__dependency(\d+)__,/g, function ( match, num ) {
							return ( dependencies[ num ] ? dependencies[ num ] + ',' : '' );
						})

						// remove __exports__
						.replace( /,?\s*__exports__/, '' )

						// `return` instead of `__exports__['default'] =`
						.replace( /__exports__\["default"\] =/, 'return' );

					return src;
				}
			}
		},
		testModules: {
			files: [{
				expand: true,
				cwd: moduleDir,
				src: [ '**/*' ],
		        rename: function(dest, src) {
		          return dest + src.replace(/\.js$/, '.html');
		        },
				dest: testsDir
			}],
			options: {
		        process: function(src, filepath) {
		        	var module = path
			        		.relative(moduleDir, filepath)
							.replace(/\.js$/, ''),
						all = grunt.config('allTestModules') || [];

		        	all.push( module );
		        	grunt.config( 'allTestModules', all );

					setLevels( filepath ); //sets grunt.config('levels')
		        	grunt.config( 'moduleName', module );
					grunt.config( 'runTestsjs', runTestsjs );

		        	return grunt.template.process(moduleTemplate);
		        }
			}
		},
		testIndex: {
			files: [{
				expand: true,
				cwd: templateDir,
				src: 'index.html',
				dest: testsDir
			}],
			options: {
		        process: function(src, filepath) {
					setLevels( filepath );
		        	return grunt.template.process(src);
		        }
			}
		}
	};
};
