define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	window.Ractive = Ractive;

	return function () {

		var fixture, fixture2, makeObj;

		module( 'Magic mode' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );
		fixture2 = document.createElement( 'div' );

		Ractive = Ractive.extend({
			template: '{{name}}: {{type}}',
			magic: true
		});

		makeObj = function () {
			return {
				name: 'Kermit',
				type: 'frog'
			};
		};

		test( 'Mustaches update when property values change', function ( t ) {
			var muppet, ractive;

			muppet = makeObj();

			ractive = new Ractive({
				el: fixture,
				data: muppet
			});

			muppet.name = 'Rizzo';
			muppet.type = 'rat';

			t.htmlEqual( fixture.innerHTML, 'Rizzo: rat' );

			muppet.name = 'Rizzo';
			muppet.type = 'rat';

			t.htmlEqual( fixture.innerHTML, 'Rizzo: rat' );
		});

		test( 'Multiple instances can share an object', function ( t ) {
			var muppet, ractive1, ractive2;

			muppet = makeObj();

			ractive1 = new Ractive({
				el: fixture,
				data: muppet
			});

			ractive2 = new Ractive({
				el: fixture2,
				data: muppet
			});

			muppet.name = 'Rizzo';
			muppet.type = 'rat';

			t.htmlEqual( fixture.innerHTML, 'Rizzo: rat' );
			t.htmlEqual( fixture2.innerHTML, 'Rizzo: rat' );

			muppet.name = 'Fozzie';
			muppet.type = 'bear';

			t.htmlEqual( fixture.innerHTML, 'Fozzie: bear' );
			t.htmlEqual( fixture2.innerHTML, 'Fozzie: bear' );
		});

		test( 'Direct property access can be used interchangeably with ractive.set()', function ( t ) {
			var muppet, ractive1, ractive2;

			muppet = makeObj();

			ractive1 = new Ractive({
				el: fixture,
				data: muppet
			});

			ractive2 = new Ractive({
				el: fixture2,
				data: muppet
			});

			muppet.name = 'Rizzo';
			muppet.type = 'rat';

			t.htmlEqual( fixture.innerHTML, 'Rizzo: rat' );
			t.htmlEqual( fixture2.innerHTML, 'Rizzo: rat' );

			ractive1.set({
				name: 'Fozzie',
				type: 'bear'
			});

			t.htmlEqual( fixture.innerHTML, 'Fozzie: bear' );
			t.htmlEqual( fixture2.innerHTML, 'Fozzie: bear' );

			ractive2.set({
				name: 'Miss Piggy',
				type: 'pig'
			});

			t.htmlEqual( fixture.innerHTML, 'Miss Piggy: pig' );
			t.htmlEqual( fixture2.innerHTML, 'Miss Piggy: pig' );

			muppet.name = 'Pepe';
			muppet.type = 'king prawn';

			t.htmlEqual( fixture.innerHTML, 'Pepe: king prawn' );
			t.htmlEqual( fixture2.innerHTML, 'Pepe: king prawn' );
		});

	};

});
