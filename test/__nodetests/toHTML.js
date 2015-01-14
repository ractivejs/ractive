/*global require, describe, it */
var Ractive = require( '../../ractive' ),
	assert = require( 'assert' ),
	renderTests = require( './samples/render' ),
	cheerio = require( 'cheerio' );

function normaliseHTML ( html ) {
	return cheerio.load( html ).html();
}

describe( 'ractive.toHTML()', function () {
	renderTests.forEach( function ( theTest ) {
		it( theTest.name, function () {
			[ false, true ].forEach( function ( magic ) {
				var data, ractive;

				data = typeof theTest.data === 'function' ? theTest.data() : deepClone( theTest.data );

				ractive = new Ractive({
					template: theTest.template,
					data: data,
					partials: theTest.partials,
					handlebars: theTest.handlebars, // TODO remove this if handlebars becomes default
					magic: magic
				});

				assert.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.result ) );

				if ( theTest.new_data ) {
					data = typeof theTest.new_data === 'function' ? theTest.new_data() : deepClone( theTest.new_data );

					ractive.set( data );
					assert.equal( normaliseHTML( ractive.toHTML() ), normaliseHTML( theTest.new_result ) );
				}

				ractive.teardown();
			});
		});
	});
});

function deepClone ( source ) {
	var target, key;

	if ( !source || typeof source !== 'object' ) {
		return source;
	}

	if ( Array.isArray( source ) ) {
		return source.slice();
	}

	target = {};

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = deepClone( source[ key ] );
		}
	}

	return target;
}
