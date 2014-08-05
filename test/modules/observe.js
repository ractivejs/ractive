define([ 'ractive' ], function ( Ractive ) {

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

		test( 'Observers fire on init when no matching data', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: {}
			});

			expect( 2 );

			ractive.observe( 'foo', function ( foo, old, keypath ) {
				t.ok( !foo );
				t.equal( keypath, 'foo' );
			});
		});

		test( 'Pattern observers do NOT fire on init when no matching data', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: {}
			});

			expect( 0 );

			ractive.observe( '*', function () {
				t.ok( true );
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

		test( 'Pattern observers fire when ractive.update() is called without parameters', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: 'whatever',
				data: { items: [ 'a', 'b', 'c' ] }
			});

			expect( 2 );

			ractive.observe( 'items.*', function ( n, o, k ) {
				t.equal( k, 'items.1' );
				t.equal( n, 'd' );
			}, { init: false });

			ractive.get( 'items' )[1] = 'd';
			ractive.update();
		});

		test( 'Pattern observers can start with wildcards (#629)', function ( t ) {
			var ractive, values;

			ractive = new Ractive({
				data: {
					foo: { number: 0 },
					bar: { number: 1 },
					baz: { number: 2 }
				}
			});

			values = {};

			ractive.observe( '*.number', function ( n, o, k ) {
				values[ k ] = n;
			});

			t.deepEqual( values, {
				'foo.number': 0,
				'bar.number': 1,
				'baz.number': 2
			});

			ractive.set( 'foo.number', 3 );
			t.deepEqual( values, {
				'foo.number': 3,
				'bar.number': 1,
				'baz.number': 2
			});
		});

		test( 'Pattern observers on arrays fire correctly after mutations', function ( t ) {
			var ractive, lastKeypath, lastValue, observedLengthChange;

			ractive = new Ractive({
				data: {
					items: [ 'a', 'b', 'c' ]
				}
			});

			ractive.observe( 'items.*', function ( n, o, k ) {
				lastKeypath = k;
				lastValue = n;

				if ( k === 'items.length' ) {
					observedLengthChange = true;
				}
			}, { init: false });

			ractive.get( 'items' ).push( 'd' );
			t.equal( lastKeypath, 'items.3' );
			t.equal( lastValue, 'd' );

			ractive.get( 'items' ).pop();
			t.equal( lastKeypath, 'items.3' );
			t.equal( lastValue, undefined );

			t.ok( !observedLengthChange );

			ractive.set( 'items.length', 4 );
			t.ok( observedLengthChange );
		});

		test( 'Pattern observers receive additional arguments corresponding to the wildcards', function ( t ) {
			var ractive, lastIndex, lastA, lastB;

			ractive = new Ractive({
				data: {
					array: [ 'a', 'b', 'c' ],
					object: {
						foo: {
							one: 1,
							two: 2
						},
						bar: {
							three: 3,
							four: 4
						}
					}
				}
			});

			ractive.observe({
				'array.*': function ( n, o, k, index ) {
					lastIndex = index;
				},
				'object.*.*': function ( n, o, k, a, b ) {
					lastA = a;
					lastB = b;
				}
			}, { init: false });

			ractive.get( 'array' ).push( 'd' );
			t.equal( lastIndex, 3 );

			ractive.set( 'object.foo.five', 5 );
			t.equal( lastA, 'foo' );
			t.equal( lastB, 'five' );
		});

		test( 'Pattern observers work with an empty array (#760)', function ( t ) {
 			var ractive = new Ractive({});
 			ractive.observe( 'foo.*.bar', function ( n, o, k ) {});
 			t.ok( true );
 		});

		test( 'Pattern observers work with an property of array (#760) varient', function ( t ) {

			var ractive = new Ractive({ data: { foo: [] } } ),
				bar = { bar: 1 };

			expect(2);

			ractive.observe('foo.*.bar', function( n, o, k ) {
			    t.equal( n, 1 );
			    t.equal( k, 'foo.0.bar' );
			});

			ractive.get( 'foo' ).push( bar );
		});

		asyncTest( 'Promises from set() operations inside observers resolve (#765)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: {
					bar: 1
				}
			});

			expect( 1 );

			ractive.observe( 'bar', function ( bar ) {
				ractive.set( 'foo', 'works' ).then( function () {
					t.ok( true );
					QUnit.start();
				});
			}, { init: false });

			ractive.set( 'bar', true );
		});

		test( 'set() operations inside observers affect the DOM immediately (related to #765)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: {
					bar: 1
				}
			});

			expect( 1 );

			ractive.observe( 'bar', function ( bar ) {
				ractive.set( 'foo', 'works' );
				t.htmlEqual( fixture.innerHTML, 'works' );
			}, { init: false });

			ractive.set( 'bar', true );
		});

		test( 'Errors inside observers are not caught', function ( t ) {
			var ractive = new Ractive({
				data: {
					bar: [ 1, 2, 3 ]
				}
			});

			expect( 2 );

			try {
				ractive.observe( 'foo', function () {
					throw new Error( 'test' );
				});
			} catch ( err ) {
				t.equal( err.message, 'test' );
			}

			try {
				ractive.observe( 'bar.*', function () {
					throw new Error( 'test' );
				});
			} catch ( err ) {
				t.equal( err.message, 'test' );
			}
		});

		test( 'Setting up and cancelling a regular observer', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: 'unimportant',
				data: {
					person: { name: 'Joe' }
				}
			});

			var dummy = false,
			observer = ractive.observe('person.name', function(nv) { dummy = nv; });

			t.equal(dummy, 'Joe');

			ractive.set('person.name', 'Londo');

			t.equal(dummy, 'Londo');

			observer.cancel();
		});

		test( 'Setting up and cancelling a pattern observer', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: 'unimportant',
				data: {
					person: { name: 'Joe' }
				}
			});

			var dummy = false,
			observer = ractive.observe('person.*', function(nv) { dummy = nv; });

			t.equal(dummy, 'Joe');

			ractive.set('person.name', 'Londo');

			t.equal(dummy, 'Londo');

			observer.cancel();
		});

		test( 'Deferred pattern observers work correctly (#1079)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: 'unimportant',
				data: {
					fruits : ['apple','banana','orange']
				}
			});

			var dummy = [],
				observer = ractive.observe('fruits.*', function(nv) { dummy.push(nv); }, { defer: true });

			t.deepEqual(dummy, [ 'apple', 'banana', 'orange' ]);

			ractive.get('fruits').push('cabbage');

			t.deepEqual(dummy, [ 'apple', 'banana', 'orange', 'cabbage' ]);

			observer.cancel();
		});
	};

});
