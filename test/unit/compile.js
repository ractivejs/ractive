// COMPILING TESTS
// ===============
//
// This loads in the compile.json sample file and checks that each template
// compiles the way you'd expect. If not, something is wrong with the compiler
//
// TODO: add moar samples


QUnit.config.reorder = false;

test( 'Ractive has a compile method', function () {
	ok( _.isFunction( Ractive.compile ) );
});

$.getJSON( 'samples/compile.json' ).done( function ( data ) {
	_.each( data, function ( t ) {
		test( t.name, function () {
			console.groupCollapsed( t.template );
			var compiled = Ractive.compile( t.template, {
				sanitize: t.sanitize,
				preserveWhitespace: t.preserveWhitespace
			});
			console.groupEnd();

			deepEqual( compiled, t.compiled );
		});
	});
});