// RENDERING TESTS
// ===============
//
// This loads in the render.json sample file and checks that each compiled
// template, in combination with the sample data, produces the expected
// HTML.
//
// TODO: add moar samples

QUnit.config.reorder = false;

var fixture = document.getElementById( 'qunit-fixture' ), tests;

tests = [
	{
		name: 'Subclass instance data extends prototype data',
		test: function () {
			var Subclass, instance;

			Subclass = Ractive.extend({
				template: '{{foo}} {{bar}}',
				data: { foo: 1 }
			});

			instance = new Subclass({
				el: fixture,
				data: { bar: 2 }
			});

			equal( fixture.innerHTML, '1 2' );
			deepEqual( instance.get(), { foo: 1, bar: 2 });
			deepEqual( Subclass.prototype.data, { foo: 1 });
		}
	}
];


_.each( tests, function ( t, i ) {
	test( t.name, function () {
		console.group(i+1);

		t.test();

		console.groupEnd();
	});
});