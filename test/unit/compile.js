// COMPILING TESTS
// ===============
//
// This loads in the compile.json sample file and checks that each template
// compiles the way you'd expect. If not, something is wrong with the compiler
//
// TODO: add moar samples


QUnit.config.reorder = false;

test( 'Anglebars has a compile method', function () {
	ok( _.isFunction( Anglebars.compile ) );
});

$.getJSON( 'samples/compile.json' ).done( function ( data ) {
	_.each( data, function ( t ) {
		test( t.name, function () {
			console.group( t.template );
			var compiled = Anglebars.compile( t.template );
			console.groupEnd();

			deepEqual( compiled, t.compiled );
		});
	});
});