define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, fixture2, makeObj;

		// only run these tests if magic mode is supported
		try {
			var obj = {}, _foo;
			Object.defineProperty( obj, 'foo', {
				get: function () {
					return _foo;
				},
				set: function ( value ) {
					_foo = value;
				}
			});
		} catch ( err ) {
			return;
		}

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

			muppet.name = 'Fozzie';
			muppet.type = 'bear';

			t.htmlEqual( fixture.innerHTML, 'Fozzie: bear' );
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

		test( 'Magic mode works with existing accessors', function ( t ) {
			var _foo, data, ractive;

			_foo = 'Bar';

			data = {};

			Object.defineProperty( data, 'foo', {
				get: function () {
					return _foo.toLowerCase();
				},
				set: function ( value ) {
					_foo = value;
				},
				configurable: true,
				enumerable: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: data
			});

			t.htmlEqual( fixture.innerHTML, 'bar' );

			data.foo = 'BAZ';
			t.htmlEqual( fixture.innerHTML, 'baz' );
		});

		test( 'Setting properties in magic mode triggers change events', function ( t ) {
			var ractive, foo;

			foo = { bar: 'baz' };

			ractive = new Ractive({
				el: fixture,
				template: '{{foo.bar}}',
				data: { foo: foo }
			});

			expect( 1 );

			ractive.on( 'change', function ( changeHash ) {
				t.deepEqual( changeHash, { 'foo.bar': 'qux' });
			});

			foo.bar = 'qux';
		});

		test( 'Regression test for #393', function ( t ) {
			var View, ractive;

			View = Ractive.extend({
				data: {
					foo: {
						a: 1,
						b: 2
					},

					bar: [
						'a', 'b', 'c'
					]
				}
			});

			ractive = new View({
				el: fixture,
				template: '{{ JSON.stringify(foo) }} | {{ JSON.stringify(bar) }}',
				magic: true
			});

			t.htmlEqual( fixture.innerHTML, '{"a":1,"b":2} | ["a","b","c"]' );

			ractive.set( 'foo.b', 3 );
			t.deepEqual( View.data, {foo:{a:1,b:2},bar:['a', 'b', 'c']});
			t.htmlEqual( fixture.innerHTML, '{"a":1,"b":3} | ["a","b","c"]' );

			ractive.set( 'bar[1]', 'd' );
			t.deepEqual( View.data, {foo:{a:1,b:2},bar:['a', 'b', 'c']});
			t.htmlEqual( fixture.innerHTML, '{"a":1,"b":3} | ["a","d","c"]' );
		});

	};

});
