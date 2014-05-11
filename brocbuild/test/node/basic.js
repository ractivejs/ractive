var Ractive = require( '../../tmp/ractive' );

exports[ 'Ractive loads in node.js' ] = function ( test ) {
	test.ok( typeof Ractive === 'function' );

	test.done();
};
