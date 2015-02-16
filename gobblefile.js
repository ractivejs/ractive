var gobble = require( 'gobble' ),
	sander = require( 'sander' ),
	path = require( 'path' ),
	esperanto = require( 'esperanto' ),
	sandbox = gobble( 'sandbox' ).moveTo( 'sandbox' ),
	version = require( './package.json' ).version,
	testGlobals = JSON.parse( sander.readFileSync( 'test/.jshintrc' ).toString() ).globals,
	es5, lib, test;

es5 = gobble( 'src' ).transform( '6to5', { blacklist: [ 'modules', 'useStrict' ] });

lib = (function () {
	var banner = sander.readFileSync( __dirname, 'src/banner.js' ).toString()
		.replace( '${version}', version )
		.replace( '${time}', new Date() )
		.replace( '${commitHash}', process.env.COMMIT_HASH || 'unknown' );

	var bundleTransform = function ( src, path ) {
		if ( /Ractive\.js$/.test( path ) ) {
			return src.replace( '${version}', version );
		}

		return src;
	};

	var lib = [
		es5.transform( 'esperanto-bundle', {
			type: 'umd',
			transform: bundleTransform,
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
				transform: bundleTransform,
				banner: banner,
				entry: 'Ractive.js',
				name: 'Ractive',
				dest: 'ractive.js',
				skip: [ 'legacy' ]
			}),

			es5.transform( 'esperanto-bundle', {
				type: 'umd',
				transform: bundleTransform,
				banner: banner,
				entry: 'Ractive.js',
				name: 'Ractive',
				dest: 'ractive.runtime.js',
				skip: [ 'legacy', 'parse/_parse' ]
			}),

			es5.transform( 'esperanto-bundle', {
				type: 'umd',
				transform: bundleTransform,
				banner: banner,
				entry: 'Ractive.js',
				name: 'Ractive',
				dest: 'ractive-legacy.runtime.js',
				skip: [ 'parse/_parse' ]
			})
		);
	}

	else {
		lib.push( sandbox );
	}

	// Combine sourcemaps from 6to5 and esperanto
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
		gobble( 'test/__tests' ).moveTo( '__tests' ),
		gobble( 'test/testdeps' ),
		es5
	]).transform( function bundleTests ( inputdir, outputdir, options ) {
		return sander.lsr( inputdir, '__tests' ).then( function ( testModules ) {
			var promises = testModules.sort().map( function ( mod ) {
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
	})
	.transform( 'es6-transpiler', {
		globals: testGlobals,
		disallowDuplicated: false,
		onError: function ( errors ) {
			// es6-transpiler is not especially clever about dealing with
			// references it doesn't expect. This squelches errors we expect
			// to encounter
			errors.forEach( function ( error ) {
				if ( /referenced before its declaration/.test( error ) ) return;
				throw new Error( error );
			});
		}
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
			.transform( 'esperanto', { type: 'cjs', sourceMap: false })
			.transform( 'es6-transpiler' )
			.moveTo( '__nodetests/samples' )
	]).moveTo( 'test' );
})();


module.exports = gobble([
	lib,
	test
]);
