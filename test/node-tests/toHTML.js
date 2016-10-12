/*global require, describe, it */
var Ractive = require( '../../ractive' );
var assert = require( 'assert' );
var renderTests = require( './samples/render' );
var cheerio = require( 'cheerio' );

function normaliseHTML ( html ) {
	return cheerio.load( html ).html().trim().replace( /^\s+/gm, '' ).replace( /\n/g, ' ' );
}

function getData ( data ) {
	return typeof data === 'function' ? data() : deepClone( data );
}

describe( 'ractive.toHTML()', function () {
	renderTests.forEach( function ( theTest ) {
		it( theTest.name, function () {
			[ false, true ].forEach( function ( magic ) {
				var data = getData( theTest.data );

				var ractive = new Ractive({
					template: theTest.template,
					data: data,
					partials: theTest.partials,
					handlebars: theTest.handlebars, // TODO remove this if handlebars becomes default
					magic: magic
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
	});

	it( 'doctype declarations handle updates (#2679)', function() {
		// the select triggers an update during bind
		var template = Ractive.parse('<!DOCTYPE html><html><select value="{{foo}}"><option value="bar">bar</option></select></html>');
		var r = new Ractive({
			template: template
		});

		r.teardown();
	});
});

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
