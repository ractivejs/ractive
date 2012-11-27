// COMPILING TESTS
// ===============
//
// This loads in the compile.json sample file and checks that each template
// compiles the way you'd expect. If not, something is wrong with the compiler
//
// TODO: add moar samples


// useful function to generate stringified JSON from a template...
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