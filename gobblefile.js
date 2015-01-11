var gobble = require( 'gobble' ),
	test = require( './test/gobblefile' ),
	es5, bundle, result = [];

gobble.cwd( __dirname );

es5 = gobble( 'src' ).transform( '6to5', { blacklist: [ 'modules', 'useStrict' ]});

bundle = es5.transform( 'esperanto-bundle', {
	type: 'umd',
	entry: 'Ractive.js',
	name: 'Ractive',
	dest: 'ractive.js'
});


result = [ bundle, test ];

if ( gobble.env() !== 'production' ) {
	result.push( gobble( 'sandbox' ).moveTo( 'sandbox' ) );
}

module.exports = gobble( result );
