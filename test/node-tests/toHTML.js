var renderTests = require( './samples/render' );
var cheerio = require( 'cheerio' );

function normaliseHTML ( html ) {
	return cheerio.load( html ).html().trim().replace( /^\s+/gm, '' ).replace( /\n/g, ' ' );
}

function getData ( data ) {
	return typeof data === 'function' ? data() : deepClone( data );
}

function deepClone ( source ) {
	if ( !source || typeof source !== 'object' ) {
		return source;
	}

	if ( Array.isArray( source ) ) {
		return source.slice();
	}

	var target = {};

	for ( var key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = deepClone( source[ key ] );
		}
	}

	return target;
}

QUnit.module( 'ractive.toHTML()' );

renderTests.forEach( function ( theTest ) {
	QUnit.test( theTest.name, function ( assert ) {
		var data = getData( theTest.data );

		var ractive = new Ractive({
			template: theTest.template,
			data: data,
			partials: theTest.partials
		});

		assert.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.result ) );

		if ( theTest.new_data ) {
			data = getData( theTest.new_data );

			ractive.set( data );
			assert.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.new_result ) );
		}

		// TODO array of data/expected

		ractive.teardown();
	});
});

QUnit.test( 'doctype declarations handle updates (#2679)', function( assert ) {
	// the select triggers an update during bind
	var template = Ractive.parse('<!DOCTYPE html><html><select value="{{foo}}"><option value="bar">bar</option></select></html>');
	var r = new Ractive({
		template: template
	});

	// If the code reached this point, then the lines before it didn't blow up.
	assert.ok(true);

	r.teardown();
});
