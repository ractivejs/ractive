var fixture = document.getElementById( 'qunit-fixture' );

test( 'Anglebars prototype has a render method', function () {
	ok( _.isFunction( Anglebars.prototype.render ) );
});

$.ajax( 'samples/render.json' ).done( function ( data ) {
	_.each( data, function ( t ) {
		test( t.name, function () {
			var anglebars = new Anglebars({
				el: fixture,
				data: t.data,
				compiled: t.compiled
			});

			equal( fixture.innerHTML, t.result );
		});
	});
});