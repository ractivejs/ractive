var stringify = function ( input, options ) {
	console.log( JSON.stringify( Anglebars.compile( input, options ) ) );
};

test( 'Anglebars has a compile method', function () {
	ok( _.isFunction( Anglebars.compile ) );
});

$.ajax( 'samples/compile.json' ).done( function ( data ) {
	_.each( data, function ( t ) {
		test( t.name, function () {
			var compiled = Anglebars.compile( t.template );

			deepEqual( compiled, t.compiled );
		});
	});
});