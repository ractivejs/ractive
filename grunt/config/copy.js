module.exports = function ( grunt) {

	var path = require('path'),
		testCwd = 'test/',
		moduleCwd = testCwd + 'modules/',
		templateCwd = testCwd + 'test-templates/',
		moduleTemplate = grunt.file.read( templateCwd + 'module.html' ),
		testDir = testCwd + 'tests/'

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
		testModules: {
			files: [{
				expand: true,
				cwd: moduleCwd,
				src: [ '**/*' ],
		        rename: function(dest, src) {
		          return dest + src.replace(/\.js$/, '.html');
		        },
				dest: testDir
			}],
			options: {
		        process: function(src, filepath) {
		        	var module = path
			        		.relative(moduleCwd, filepath)
							.replace(/\.js$/, ''),
						all = grunt.config('allTestModules') || [],
						levels = path.relative( path.resolve( filepath ), path.resolve( testCwd ) )

					levels = levels.substring(0, levels.length-2)

		        	all.push(module)
		        	grunt.config('allTestModules', all)

		        	grunt.config('levels', levels)
		        	grunt.config('moduleName', module)
		        	return grunt.template.process(moduleTemplate);
		        }
			}
		},
		testIndex: {
			files: [{
				expand: true,
				cwd: templateCwd,
				src: 'index.html',
				dest: testDir
			}],
			options: {
		        process: function(src, filepath) {
		        	return grunt.template.process(src);
		        }				
			}
		}
	};
};
