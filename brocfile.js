	// utilities
var pick = require('broccoli-static-compiler'),
	merge = require('broccoli-merge-trees'),
	// filters
	transpileES6 = require('broccoli-es6-module-transpiler'),
	cleanTranspiled = require('./broccoli/clean-transpiled');

function copy( path ) {
	return pick( path, { srcDir: '/', destDir: '/' + path } );
}

var src = pick('src', {
		srcDir: '/',
		files: [ '**/*.js' ],
		destDir: '/.amd'
	}),
	transpiled = transpileES6( src, {
		moduleName: function(filePath) {
			return filePath.replace(/.js$/, '');
  		}
	}),
	amd = cleanTranspiled( transpiled );

module.exports = merge( [ amd, copy( 'test' ), copy( 'sandbox' ) ] );
