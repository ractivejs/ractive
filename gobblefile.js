var gobble = require( 'gobble' ),
	src, test, result = [];

var transpilerOptions = {
	globals: 'define Promise QUnit _modules test start asyncTest ok equal notEqual deepEqual expect throws simulant HTMLDocument jQuery MouseEvent'.split( ' ' ).reduce( function ( globals, name ) {
		globals[ name ] = true;
		return globals;
	}, {})
};

src = gobble( 'src' )
	.map( 'esperanto', { defaultOnly: true })
	.map( 'es6-transpiler', transpilerOptions )
	.moveTo( 'src' );

test = gobble( 'test' )
	.map( 'es6-transpiler', transpilerOptions )
	.moveTo( 'test' );

result = [ src, test ];

if ( gobble.env() !== 'production' ) {
	result.push( gobble( 'sandbox' ).moveTo( 'sandbox' ) );
}

module.exports = gobble( result );
