	// utilities
var pick = require('broccoli-static-compiler'),
	merge = require('broccoli-merge-trees'),
	// filters
	transpileES6 = require('broccoli-es6-transpiler'),
	transpileES6Modules = require('broccoli-es6-module-transpiler'),
	cleanTranspiled = require('./broccoli/clean-transpiled');

function copy( path ) {
	return pick( path, { srcDir: '/', destDir: '/' + path } );
}

var src = pick('src', {
		srcDir: '/',
		files: [ '**/*.js' ],
		destDir: '/.amd'
	}),
	transpiledModules = transpileES6Modules( src, {
		moduleName: function(filePath) {
			return filePath.replace(/.js$/, '');
  		}
	}),
	transpiled = transpileES6( transpiledModules, {
		globals: {
			define: true,
			Promise: true
		}
	}),
	amd = cleanTranspiled( transpiled );

module.exports = merge( [ amd, copy( 'test' ), copy( 'sandbox' ) ] );
