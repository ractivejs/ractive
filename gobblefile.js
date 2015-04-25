var gobble = require( 'gobble' ),
	sander = require( 'sander' ),
	junk = require( 'junk' ),
	Promise = sander.Promise,
	path = require( 'path' ),
	esperanto = require( 'esperanto' ),
	sandbox = gobble( 'sandbox' ).moveTo( 'sandbox' ),
	version = require( './package.json' ).version,
	es5, lib, test;

var babelTransformWhitelist = [
	'es3.memberExpressionLiterals',
	'es3.propertyLiterals',
	'es6.arrowFunctions',
	'es6.blockScoping',
	'es6.constants',
	'es6.destructuring',
	'es6.parameters.default',
	'es6.parameters.rest',
	'es6.properties.shorthand',
	'es6.templateLiterals'
];

es5 = gobble( 'src' ).transform( 'babel', {
	whitelist: babelTransformWhitelist
});

lib = (function () {
	var banner = sander.readFileSync( __dirname, 'src/banner.js' ).toString()
		.replace( '${version}', version )
		.replace( '${time}', new Date() )
		.replace( '${commitHash}', process.env.COMMIT_HASH || 'unknown' );

	var lib = [
		es5.transform( 'esperanto-bundle', {
			type: 'umd',
			transform: function ( src, path ) {
				if ( /(Ractive\.js|utils\/log\.js)$/.test( path ) ) {
					return src.replace( /<@version@>/g, version );
				}

				return src;
			},
			banner: banner,
			entry: 'Ractive.js',
			name: 'Ractive',
			dest: 'ractive-legacy.js'
		})
	];

	if ( gobble.env() === 'production' ) {
		// Add non-legacy and runtime-only builds
		lib.push(
			es5.transform( 'esperanto-bundle', {
				type: 'umd',
				transform: function ( src, path ) {
					if ( /(Ractive\.js|utils\/log\.js)$/.test( path ) ) {
						return src.replace( /<@version@>/g, version );
					}

					if ( /legacy\.js/.test( path ) ) {
						return 'export default null;';
					}

					return src;
				},
				banner: banner,
				entry: 'Ractive.js',
				name: 'Ractive',
				dest: 'ractive.js'
			}),

			es5.transform( 'esperanto-bundle', {
				type: 'umd',
				transform: function ( src, path ) {
					if ( /(Ractive\.js|utils\/log\.js)$/.test( path ) ) {
						return src.replace( /<@version@>/g, version );
					}

					if ( /legacy\.js|_parse\.js/.test( path ) ) {
						return 'export default null;';
					}

					return src;
				},
				banner: banner,
				entry: 'Ractive.js',
				name: 'Ractive',
				dest: 'ractive.runtime.js'
			}),

			es5.transform( 'esperanto-bundle', {
				type: 'umd',
				transform: function ( src, path ) {
					if ( /(Ractive\.js|utils\/log\.js)$/.test( path ) ) {
						return src.replace( /<@version@>/g, version );
					}

					if ( /_parse\.js/.test( path ) ) {
						return 'export default null;';
					}

					return src;
				},
				banner: banner,
				entry: 'Ractive.js',
				name: 'Ractive',
				dest: 'ractive-legacy.runtime.js'
			})
		);
	}

	else {
		lib.push( sandbox );
	}

	// Combine sourcemaps from babel and esperanto
	lib = lib.map( function ( node ) {
		return node.transform( 'sorcery' );
	});

	return lib;
})();

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
			whitelist: babelTransformWhitelist,
			sourceMap: false
		}),
		es5
	]).transform( function bundleTests ( inputdir, outputdir, options ) {
		return sander.lsr( inputdir, '__tests' ).then( function ( testModules ) {
			var promises = testModules.filter( junk.not ).sort().map( function ( mod ) {
				return esperanto.bundle({
					base: inputdir,
					entry: '__tests/' + mod
				}).then( function ( bundle ) {
					return sander.writeFile( outputdir, mod, bundle.concat({}).code );
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
			.transform( 'babel', { whitelist: babelTransformWhitelist, sourceMap: false })
			.transform( 'esperanto', { type: 'cjs', sourceMap: false })
			.moveTo( '__nodetests/samples' )
	]).moveTo( 'test' );
})();


module.exports = gobble([
	lib,
	test
]);
