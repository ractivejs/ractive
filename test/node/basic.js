var Ractive = require( '../../tmp/Ractive' );

exports[ 'Ractive loads in node.js' ] = function ( test ) {
	test.ok( typeof Ractive === 'function' );

	test.done();
};