// RENDERING TESTS
// ===============
//
// This loads in the render.json sample file and checks that each compiled
// template, in combination with the sample data, produces the expected
// HTML.
//
// TODO: add moar samples

QUnit.config.reorder = false;

var fixture = document.getElementById( 'qunit-fixture' );

test( 'Anglebars prototype has a render method', function () {
	ok( _.isFunction( Anglebars.prototype.render ) );
});

$.getJSON( 'samples/render.json' ).done( function ( data ) {
	_.each( data, function ( t, i ) {
		test( t.name, function () {
			console.group(i+2);

			var anglebars = new Anglebars({
				el: fixture,
				data: t.data,
				template: t.template,
				partials: t.partials
			});

			equal( fixture.innerHTML, t.result );

			console.groupEnd();
		});
	});
});