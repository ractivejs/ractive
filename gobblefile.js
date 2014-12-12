var gobble = require( 'gobble' ),
	es5, amd, bundle, src, test, result = [];

var transpilerOptions = {
	globals: 'define Promise QUnit _modules test start asyncTest ok equal notEqual deepEqual expect throws simulant HTMLDocument jQuery MouseEvent'.split( ' ' ).reduce( function ( globals, name ) {
		globals[ name ] = true;
		return globals;
	}, {})
};

es5 = gobble( 'src' ).transform( '6to5', { blacklist: [ 'modules', 'useStrict' ]});
amd = es5.transform( 'esperanto', { strict: true });

bundle = es5.transform( 'esperanto-bundle', {
	type: 'umd',
	entry: 'Ractive.js',
	name: 'Ractive',
	dest: 'ractive.js'
});

src = gobble([ amd, bundle ]).moveTo( 'src' );

test = gobble( 'test' )
	.transform( 'es6-transpiler', transpilerOptions )
	.moveTo( 'test' );

result = [ src, test ];

if ( gobble.env() !== 'production' ) {
	result.push( gobble( 'sandbox' ).moveTo( 'sandbox' ) );
}

module.exports = gobble( result );
