var gobble = require( 'gobble' ),
	sander = require( 'sander' ),
	src = gobble( 'src' ),
	sandbox = gobble( 'sandbox' ).moveTo( 'sandbox' ),
	version = require( './package.json' ).version,
	banner,
	bundleTransform,
	es5, result;

banner = sander.readFileSync( __dirname, 'src/banner.js' ).toString()
	.replace( '${version}', version )
	.replace( '${time}', new Date() )
	.replace( '${commitHash}', process.env.COMMIT_HASH || 'unknown' );

bundleTransform = function ( src, path ) {
	if ( /Ractive\.js$/.test( path ) ) {
		return src.replace( '${version}', version );
	}

	return src;
};

es5 = src.transform( '6to5', { blacklist: [ 'modules', 'useStrict' ]});

result = [
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
	result.push(
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

	// TODO sourcemaps are currently pooched. Investigating...
	/*result = result.map( function ( node ) {
		return node.transform( 'sorcery' );
	});*/
}

else {
	result.push( sandbox );
}

module.exports = gobble([
	result,
	require( './test/gobblefile' )
]);
