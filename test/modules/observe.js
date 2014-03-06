define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'ractive.observe()' );

		test( 'Observers fire before the DOM updates', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}{{bar}}{{/foo}}',
				data: { bar: 'yeah' }
			});

			expect( 1 );

			ractive.observe( 'foo', function ( foo ) {
				t.equal( fixture.innerHTML, '' );
			}, { init: false });

			ractive.set( 'foo', true );
		});

		test( 'Observers with { defer: true } fire after the DOM updates', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}{{bar}}{{/foo}}',
				data: { bar: 'yeah' }
			});

			expect( 1 );

			ractive.observe( 'foo', function ( foo ) {
				t.equal( fixture.innerHTML, 'yeah' );
			}, { init: false, defer: true });

			ractive.set( 'foo', true );
		});

		test( 'Observer can be created without an options argument', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'bar' }
			});

			expect( 1 );

			ractive.observe( 'foo', function ( foo ) {
				t.equal( foo, 'bar' );
			});
		});

		test( 'Uninitialised observers do not fire if their keypath is set to the same value', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'bar' }
			});

			expect( 0 );

			ractive.observe( 'foo', function ( foo ) {
				t.ok( 0 );
			}, { init: false });

			ractive.set( 'foo', 'bar' );
		});

		test( 'Pattern observers fire on changes to keypaths that match their pattern', function ( t ) {
			var ractive, expected;

			ractive = new Ractive({
				el: fixture,
				template: 'blah',
				data: { foo: { bar: { baz: 1 } } }
			});

			expect( 4 );

			expected = 1;

			ractive.observe( 'foo.bar.*', function ( n, o, keypath ) {
				t.equal( n, expected );
				t.equal( keypath, 'foo.bar.baz' );
			});

			expected = 2;
			ractive.set( 'foo.bar.baz', expected );
		});

		test( 'Pattern observers fire on changes to keypaths downstream of their pattern', function ( t ) {
			var ractive, expected;

			ractive = new Ractive({
				el: fixture,
				template: 'blah',
				data: { foo: { bar: { baz: 1 } } }
			});

			expect( 4 );

			expected = { baz: 1 };

			ractive.observe( 'foo.*', function ( n, o, keypath ) {
				t.deepEqual( n, expected );
				t.equal( keypath, 'foo.bar' );
			});

			expected = { baz: 2 };
			ractive.set( 'foo.bar.baz', 2 );
		});

		test( 'Pattern observers fire on changes to keypaths upstream of their pattern', function ( t ) {
			var ractive, expected;

			ractive = new Ractive({
				el: fixture,
				template: 'blah',
				data: { foo: { bar: { baz: 1 } } }
			});

			expect( 4 );

			expected = 1;

			ractive.observe( 'foo.*.baz', function ( n, o, keypath ) {
				t.deepEqual( n, expected );
				t.equal( keypath, 'foo.bar.baz' );
			});

			expected = 2;
			ractive.set( 'foo', { bar: { baz: 2 } });
		});

		test( 'Pattern observers can have multiple wildcards', function ( t ) {
			var ractive, expected;

			ractive = new Ractive({
				el: fixture,
				template: 'blah',
				data: { foo: { bar: { baz: 1 } } }
			});

			expect( 4 );

			expected = 1;

			ractive.observe( 'foo.*.*', function ( n, o, keypath ) {
				t.deepEqual( n, expected );
				t.equal( keypath, 'foo.bar.baz' );
			});

			expected = 2;
			ractive.set( 'foo.bar', { baz: 2 });
		});

		test( 'The first key in a pattern observer\'s pattern can be a wildcard', function ( t ) {
			var ractive, expected;

			ractive = new Ractive({
				el: fixture,
				template: 'blah',
				data: { gup: { foo: { bar: { baz: 1 } } } }
			});

			expect( 4 );

			expected = 1;

			ractive.observe( 'gup.*.bar.baz', function ( n, o, keypath ) {
				t.deepEqual( n, expected );
				t.equal( keypath, 'gup.foo.bar.baz' );
			});

			expected = 2;
			ractive.set( 'gup.foo.bar', { baz: 2 });
		});

		test( 'Observers can observe multiple keypaths, separated by a space', function ( t ) {
			var ractive, results;

			ractive = new Ractive({
				el: fixture,
				template: 'irrelevant'
			});

			results = {};

			ractive.observe( 'foo bar baz', function ( n, o, k ) {
				results[ k ] = n;
			});

			ractive.observe({
				'a b': function ( n, o, k ) {
					results[ k ] = n;
				}
			})

			ractive.set( 'foo', 'one' );
			ractive.set({
				bar: 'two',
				baz: 'three'
			});

			ractive.set( 'a', 1 );
			ractive.set( 'b', 2 );

			t.deepEqual( results, { foo: 'one', bar: 'two', baz: 'three', a: 1, b: 2 });
		});

	};

});
