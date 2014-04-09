var Ractive, parseTests;

Ractive = require( '../../tmp/ractive' );
parseTests = require( '../samples/parse' );

parseTests.forEach( function ( theTest ) {
	exports[ theTest.name ] = function ( test ) {
		var parsed = Ractive.parse( theTest.template, theTest.options );
		test.deepEqual( parsed, theTest.parsed );

		test.done();
	};
});
