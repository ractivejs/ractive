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
	function compileTemplate ( str ) {
		return function ( data ) {
			return str.replace( /\${([^}]+)}/g, function ( match, $1 ) {
				return $1 in data ? data[ $1 ] : match;
			});
		};
	}

	var templates = {
		testpage: compileTemplate( sander.readFileSync( 'test/templates/testpage.html' ).toString() ),
		index: compileTemplate( sander.readFileSync( 'test/templates/index.html' ).toString() )
	};

	var testModules = gobble([
		gobble([
			gobble( 'test/__tests' ).moveTo( '__tests' ),
			gobble( 'test/testdeps' )
		]).transform( 'babel', {
			sourceMap: false
		}),
		es5
	]).transform( function bundleTests ( inputdir, outputdir, options ) {
		return sander.lsr( inputdir, '__tests' ).then( function ( testModules ) {
			var promises = testModules.filter( junk.not ).sort().map( function ( mod ) {
				return rollup.rollup({
					entry: inputdir + '/__tests/' + mod,
					resolveId: function ( importee, importer ) {
						if ( importee === 'qunit' ) return false;

						if ( !importer ) return importee;

						if ( importee[0] === '.' ) {
							return path.resolve( path.dirname( importer ), importee ) + '.js';
						}

						return path.resolve( inputdir, importee ) + '.js';
					},
					load: function ( id ) {
						var code = sander.readFileSync( id, { encoding: 'utf-8' })
							.replace( /import cleanup.+/, '' ); // TEMP

						if ( /helpers\/cleanup/.test( id ) ) return code;

						return 'import cleanup from \'helpers/cleanup\';\n\n' +
						       'module(\'' + mod + '\', { afterEach: cleanup });\n\n' +
						        code;
					}
				}).then( function ( bundle ) {
					return bundle.write({
						dest: outputdir + '/' + mod,
						format: 'iife',
						globals: {
							qunit: 'QUnit'
						}
					});
				});
			});

			return Promise.all( promises ).then( function () {
				// index page
				var index = templates.index({
					scriptBlock: testModules.map( function ( src ) {
						return '<script src="' + src + '"></script>';
					}).join( '\n\t' )
				});

				return sander.writeFile( outputdir, 'index.html', index );
			});
		});
	});

	var testPages = testModules.transform( function () {
		return templates.testpage({
			testModule: path.basename( this.filename ),
			name: this.filename.replace( /\.js$/, '' )
		});
	}, { accept: '.js', ext: '.html' });

	return gobble([
		testModules,
		testPages,
		gobble( 'test/root' ),
		gobble( 'test/__nodetests' ).moveTo( '__nodetests' ),
		gobble( 'test/testdeps/samples' )
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
			.moveTo( '__nodetests/samples' )
	]).moveTo( 'test' );
})();


module.exports = gobble([
	lib,
	test
]);
