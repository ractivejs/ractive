var Ractive, renderTests, cheerio, normaliseHTML;

Ractive = require( '../../tmp/Ractive' );
renderTests = require( '../samples/render' );
cheerio = require( 'cheerio' );

normaliseHTML = function ( html ) {
	return cheerio.load( html ).html();
};

renderTests.forEach( function ( theTest ) {
	exports[ theTest.name ] = function ( test ) {

		var ractive = new Ractive({
			template: theTest.template,
			data: theTest.data,
			partials: theTest.partials
		});

		test.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.result ) );

		if ( theTest.new_data ) {
			ractive.set( theTest.new_data );
			test.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.new_result ) );
		}

		ractive.teardown();

		test.done();
	};
});