/*global require, module, __dirname, process */
/*eslint no-var:0, object-shorthand:0 */
var gobble = require( 'gobble' );
var sander = require( 'sander' );
var junk = require( 'junk' );
var Promise = sander.Promise;
var path = require( 'path' );
var rollup = require( 'rollup' );
var sandbox = gobble( 'sandbox' ).moveTo( 'sandbox' );
var version = require( './package.json' ).version;

var src = gobble( 'src' );
var es5 = src.transform( 'babel' );
var lib;
var test;

if ( gobble.env() === 'production' ) {
	var banner = sander.readFileSync( __dirname, 'src/banner.js' ).toString()
		.replace( '${version}', version )
		.replace( '${time}', new Date() )
		.replace( '${commitHash}', process.env.COMMIT_HASH || 'unknown' );

	lib = gobble([
		src.transform( 'rollup-babel', {
			format: 'umd',
			transform: function ( src, path ) {
				if ( /(Ractive\.js|utils[\/\\]log\.js)$/.test( path ) ) {
					return src.replace( /<@version@>/g, version );
				}

				return src;
			},
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive-legacy.js',
			banner: banner
		}),

		src.transform( 'rollup-babel', {
			format: 'umd',
			transform: function ( src, path ) {
				if ( /(Ractive\.js|utils[\/\\]log\.js)$/.test( path ) ) {
					return src.replace( /<@version@>/g, version );
				}

				if ( /legacy\.js/.test( path ) ) {
					return 'export default null;';
				}

				return src;
			},
			banner: banner,
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive.js'
		}),

		src.transform( 'rollup-babel', {
			format: 'umd',
			transform: function ( src, path ) {
				if ( /(Ractive\.js|utils[\/\\]log\.js)$/.test( path ) ) {
					return src.replace( /<@version@>/g, version );
				}

				if ( /legacy\.js|_parse\.js/.test( path ) ) {
					return 'export default null;';
				}

				return src;
			},
			banner: banner,
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive.runtime.js'
		}),

		src.transform( 'rollup-babel', {
			format: 'umd',
			transform: function ( src, path ) {
				if ( /(Ractive\.js|utils[\/\\]log\.js)$/.test( path ) ) {
					return src.replace( /<@version@>/g, version );
				}

				if ( /_parse\.js/.test( path ) ) {
					return 'export default null;';
				}

				return src;
			},
			banner: banner,
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive-legacy.runtime.js'
		})
	]);
} else {
	lib = gobble([
		es5.transform( 'rollup', {
			format: 'umd',
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive-legacy.js'
		}),

		sandbox
	]);
}

test = (function () {
	var testFiles = sander.lsrSync( 'test/browser-tests' ).filter( junk.not );

	var testModules = gobble([
		gobble([
			gobble( 'test/browser-tests' ).moveTo( 'browser-tests' ),
			gobble( 'test/__support/js' )
		]).transform( 'babel', {
			sourceMap: false
		}),
		es5
	]).transform( function bundleTests ( inputdir, outputdir, options ) {
		var globals = {
			qunit: 'QUnit',
			simulant: 'simulant'
		};

		var promises = testFiles.sort().map( function ( mod ) {
			return rollup.rollup({
				entry: inputdir + '/browser-tests/' + mod,
				resolveId: function ( importee, importer ) {
					if ( globals[ importee ] ) return false;

					if ( !importer ) return importee;

					if ( importee[0] === '.' ) {
						return path.resolve( path.dirname( importer ), importee ) + '.js';
					}

					return path.resolve( inputdir, importee ) + '.js';
				},
				load: function ( id ) {
					var code = sander.readFileSync( id, { encoding: 'utf-8' });

					if ( /test-config/.test( id ) ) return code;

					return 'import { initModule } from \'test-config\';\n' +
					       'initModule(\'' + mod + '\' );\n\n' +
					        code;
				}
			}).then( function ( bundle ) {
				return bundle.write({
					dest: outputdir + '/' + mod,
					format: 'iife',
					globals: globals
				});
			});
		});

		return Promise.all( promises );
	});

	return gobble([
		gobble( 'test/__support/index.html' )
			.transform( 'replace', {
				scriptBlock: testFiles.map( function ( src ) {
					return '<script src="' + src + '"></script>';
				}).join( '\n\t' )
			}),
		testModules,
		gobble( 'test/__support/files' ),
		gobble( 'test/node-tests' ).moveTo( 'node-tests' ),
		gobble( 'test/__support/js/samples' )
			.include( '*.js' )
			.transform( 'babel', {
				whitelist: [
					'es3.memberExpressionLiterals',
					'es3.propertyLiterals',
					'es6.arrowFunctions',
					'es6.blockScoping',
					'es6.constants',
					'es6.destructuring',
					'es6.parameters',
					'es6.spread',
					'es6.properties.shorthand',
					'es6.properties.computed',
					'es6.templateLiterals',
					'es6.classes',
					'es6.modules'
				],
				loose: [ 'es6.classes' ],
				sourceMap: false
			})
			.moveTo( 'node-tests/samples' )
	]).moveTo( 'test' );
})();

module.exports = gobble([
	lib,
	test
]);
