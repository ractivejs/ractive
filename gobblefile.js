var gobble = require( 'gobble' ),
	es5, amd, bundle, src, test, result = [];

var transpilerOptions = {
	globals: 'define Promise QUnit _modules test start asyncTest ok equal notEqual deepEqual expect throws simulant HTMLDocument jQuery MouseEvent'.split( ' ' ).reduce( function ( globals, name ) {
		globals[ name ] = true;
		return globals;
	}, {})
};

var to5Opts = { blacklist: [ 'modules', 'useStrict' ] };
var amdOpts = { strict: true };

// disable sourcemaps for dev mode for now, since it loads all the modules via AMD
if ( gobble.env() === 'development' ) {
	to5Opts.sourceMap = false;
	amdOpts.sourceMap = false;
}

es5 = gobble( 'src' ).transform( '6to5', to5Opts );
amd = es5.transform( 'esperanto', amdOpts );

bundle = es5.transform( 'esperanto-bundle', {
	type: 'umd',
	entry: 'Ractive.js',
	name: 'Ractive',
	dest: '../ractive.js',
	strict: true
});

src = gobble([ amd, bundle ]).moveTo( 'src' );

test = gobble([
	gobble( 'test' ).exclude([ 'modules/**', 'samples/**' ]),
	gobble( 'test' ).include([ 'modules/**', 'samples/**' ]).transform( 'es6-transpiler', transpilerOptions )
]).moveTo( 'test' );

result = [ src, test ];

if ( gobble.env() !== 'production' ) {
	result.push( gobble( 'sandbox' ).moveTo( 'sandbox' ) );
}

module.exports = gobble( result );
