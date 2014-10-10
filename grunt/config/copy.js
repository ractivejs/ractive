module.exports = function ( grunt) {

	var path = require('path'),
		testDir = 'test/',
		testsDir = testDir + 'tests/',
		moduleDir = testDir + 'modules/',
		templateDir = testDir + 'test-templates/',
		runTestsjs = grunt.file.read( templateDir + 'runTests.js' ),
		moduleTemplate = grunt.file.read( templateDir + 'module.html' )

	function setLevels(filepath){
		var levels = path.relative( path.resolve( filepath ), path.resolve( testDir ) ).replace(/\\/g, '/');
		levels = levels.substring( 0, levels.length-2 );
		grunt.config( 'levels', levels );
	}

	return {
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
					.replace(/\\/g, '/')
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
