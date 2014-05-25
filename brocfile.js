	// utilities
var pick = require('broccoli-static-compiler'),
	merge = require('broccoli-merge-trees'),
	env = require('broccoli-env').getEnv();
	// filters
	transpileES6 = require('broccoli-es6-transpiler'),
	transpileES6Modules = require('broccoli-es6-module-transpiler'),
	clean = require('./broccoli/clean-transpiled');

function copy( path ) {
	return pick( path, { srcDir: '/', destDir: '/' + path } );
}

function makeGlobals ( globals ) {
	return globals.reduce( function( obj, global ) {
		obj[ global ] = true;
		return obj;
	}, {} )
}

var globals = ['define', 'Promise'];

function transpile ( tree ) {

	return transpileES6( tree, {
		globals: makeGlobals( globals )
	});

}

function fullTranspile ( tree ) {

	tree = transpileES6Modules( tree, {
		moduleName: function(filePath) {
			return filePath.replace(/.js$/, '');
  		}
	});

	tree = transpile( tree );

	return clean( tree );
}

var src = pick('src', {
		srcDir: '/',
		files: [ '**/*.js' ],
		destDir: '/src'
	});
src = fullTranspile( src )

globals = globals.concat( [
	'QUnit', '_modules', 'test', 'start', 'asyncTest',
	'ok', 'equal', 'notEqual',  'deepEqual', 'expect', 'throws' ] );

globals = globals.concat( [ 'simulant', 'HTMLDocument', 'jQuery', 'MouseEvent' ] );

var test = transpile( copy( 'test' ) );

var out = [ src, test ];
if ( env !== 'production' ) { out = out.concat( [ copy( 'sandbox' ) ] ); }

module.exports = merge( out );
