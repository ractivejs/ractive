/*global require, module, __dirname, process */
/*eslint no-var:0, object-shorthand:0 */
var gobble = require( 'gobble' );
var sander = require( 'sander' );
var junk = require( 'junk' );
var Promise = sander.Promise;
var rollup = require( 'rollup' );
var rollupBuble = require( 'rollup-plugin-buble' );

var sandbox = gobble( 'sandbox' ).moveTo( 'sandbox' );
var version = require( './package.json' ).version;

var bubleOptions = { target: { ie: 9 } };
var bubleLegacyOptions = { target: { ie: 8 } };

var src = gobble( 'src' );
var es5 = src.transform( 'buble', { target: { ie: 8 } });
var lib;
var test;

function noop () {}

function adjustAndSkip ( pattern ) {
	return { transform: function ( src, path ) {
		if ( /(Ractive\.js|utils[\/\\]log\.js)$/.test( path ) ) {
			return src.replace( /<@version@>/g, version );
		}

		if ( pattern && pattern.test( path ) ) {
			return 'export default null;';
		}

		return src;
	} };
}

function noConflict ( src ) {
	src = src.replace( 'global.Ractive = factory()', '(function() { var current = global.Ractive; var next = factory(); next.noConflict = function() { global.Ractive = current; return next; }; return global.Ractive = next; })()' );
	return src;
}

if ( gobble.env() === 'production' ) {
	var banner = sander.readFileSync( __dirname, 'src/banner.js' ).toString()
		.replace( '${version}', version )
		.replace( '${time}', new Date() )
		.replace( '${commitHash}', process.env.COMMIT_HASH || 'unknown' );

	lib = gobble([
		es5.transform( 'rollup', {
			plugins: [ adjustAndSkip() ],
			format: 'umd',
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive-legacy.js',
			banner: banner
		}),

		es5.transform( 'rollup', {
			plugins: [ adjustAndSkip( /legacy\.js/ ) ],
			format: 'umd',
			banner: banner,
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive.js'
		}),

		es5.transform( 'rollup', {
			plugins: [ adjustAndSkip( /legacy\.js|_parse\.js/ ) ],
			format: 'umd',
			banner: banner,
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive.runtime.js'
		}),

		es5.transform( 'rollup', {
			plugins: [ adjustAndSkip( /_parse\.js/ ) ],
			format: 'umd',
			banner: banner,
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive-legacy.runtime.js'
		})
	]).transform( noConflict );
} else {
	lib = gobble([
		es5.transform( 'rollup', {
			plugins: [ adjustAndSkip() ],
			format: 'umd',
			entry: 'Ractive.js',
			moduleName: 'Ractive',
			dest: 'ractive-legacy.js'
		}).transform( noConflict ),

		sandbox
	]);
}

test = (function () {
	var testFiles = sander.lsrSync( 'test/browser-tests' ).filter( junk.not );
	var globals = {
		qunit: 'QUnit',
		simulant: 'simulant'
	};

	var browserTests = gobble( 'test/browser-tests' ).moveTo( 'browser-tests' ).transform( function bundleTests ( inputdir, outputdir, options ) {
		testFiles.sort();
		var modules = [];

		var files = Promise.all( testFiles.map( function( f ) {
			f = f.replace(/\\/g, '/');

			return sander.readFile( inputdir, 'browser-tests', f ).then( function( data ) {
				data = data.toString( 'utf8' );
				if ( f.indexOf( 'polyfills.js' ) !== -1 || data.indexOf( 'initModule(' ) !== -1 ) {
					modules.push( f );
					return sander.link( inputdir, 'browser-tests', f ).to( outputdir, 'browser-tests', f );
				} else {
					console.log( 'WARNING: not including test ' + f );
				}
			});
		}));
		return files.then( function() {
			var imprts = [], stmts = [];

			modules.map( function( f ) {
				var mod = f.replace( /[^a-z]/gi, '_' );
				imprts.push( 'import ' + mod + ' from \'./' + f + '\';' );
				stmts.push( mod + '();' );
			});

			return sander.writeFile( outputdir, 'browser-tests/all.js', imprts.join( '\n' ) + stmts.join( '\n' ) );
		});
	});

	var testModules = gobble([
		es5,
		gobble([ browserTests, gobble( 'test/__support/js' )
			.moveTo( 'browser-tests' ) ])
			.transform( 'buble', bubleLegacyOptions )
	]).transform( 'rollup', {
		plugins: [ adjustAndSkip() ],
		format: 'umd',
		entry: 'browser-tests/all.js',
		moduleName: 'tests',
		dest: 'all.js',
		globals: {
			qunit: 'QUnit',
			simulant: 'simulant'
		}
	});
		/*var promises = testFiles.sort().map( function ( mod ) {
			var transform = {
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
						'initModule(\'' + mod.replace( /\\/g, '/' ) + '\' );\n\n' +
						code;
				}
			};

			return rollup.rollup({
				entry: inputdir + '/browser-tests/' + mod,
				plugins: [ transform, legacyBabel ],
				globals: globals,
				onwarn: noop
			}).then( function ( bundle ) {
				return bundle.write({
					dest: outputdir + '/' + mod,
					format: 'iife',
					globals: globals
				});
			});
		});

		return Promise.all( promises );
		*/
	//}).transform( bloodyIE8 );

	return gobble([
		gobble( 'test/__support/index.html' )
			.transform( 'replace', {
				scriptBlock: '<script src="all.js"></script>'
			}),
		/*gobble( 'test/__support/index.html' )
			.transform( 'replace', {
				scriptBlock: testFiles.map( function ( src ) {
					return '<script src="' + src + '"></script>';
				}).join( '\n\t' )
			}),*/
		testModules,
		gobble( 'test/__support/files' ),
		gobble( 'test/node-tests' ).moveTo( 'node-tests' ),
		gobble( 'test/__support/js/samples' )
			.include( '*.js' )
			.transform( function bundleSamples ( inputDir, outputDir, options ) {
				return sander.lsr(inputDir).then( function ( files ) {
					var promises = files.map( function ( file ) {
						return rollup.rollup({
							entry: inputDir + '/' + file,
							plugins: [ rollupBuble( bubleLegacyOptions ) ],
							globals: globals,
							onwarn: noop
						}).then( function ( bundle ) {
							return bundle.write({
								dest: outputDir + '/' + file,
								format: 'cjs',
								globals: globals,
								moduleName: 'tests'
							});
						});
					});
					return Promise.all(promises);
				});
			})
			.moveTo( 'node-tests/samples' )
	]).moveTo( 'test' );
})();

module.exports = gobble([
	lib,
	test
]);
