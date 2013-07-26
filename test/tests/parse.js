// PARSING TESTS
// =============
//
// This loads in the parse.json sample file and checks that each template
// parses the way you'd expect. If not, something is wrong with the parser
//
// TODO: add moar samples


QUnit.config.reorder = false;

test( 'Ractive has a parse method', function () {
	ok( _.isFunction( Ractive.parse ) );
});

$.getJSON( 'samples/parse.json' ).done( function ( data ) {
	_.each( data, function ( t ) {
		test( t.name, function () {
			console.groupCollapsed( t.template );
			var parsed = Ractive.parse( t.template, {
				sanitize: t.sanitize,
				preserveWhitespace: t.preserveWhitespace
			});
			console.groupEnd();

			deepEqual( parsed, t.parsed );
		});
	});
});