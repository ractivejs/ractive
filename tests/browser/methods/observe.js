import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/observe.js' );

	test( 'Observers fire before the DOM updates', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}{{bar}}{{/foo}}',
			data: { bar: 'yeah' }
		});

		ractive.observe( 'foo', () => {
			t.equal( fixture.innerHTML, '' );
		}, { init: false });

		ractive.set( 'foo', true );
	});

	test( 'Observers with { defer: true } fire after the DOM updates', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}{{bar}}{{/foo}}',
			data: { bar: 'yeah' }
		});

		ractive.observe( 'foo', () => {
			t.equal( fixture.innerHTML, 'yeah' );
		}, { init: false, defer: true });

		ractive.set( 'foo', true );
	});

	test( 'Observers with { defer: true } fire after non-transitioned nodes removed from DOM (#1869)', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
			data: { items: [ 1, 2, 3 ] }
		});

		ractive.observe( 'items', function () {
			t.equal( this.findAll('li').length, this.el.querySelectorAll('li').length );
		}, { init: false, defer: true });

		ractive.pop( 'items' );
	});

	test( 'Observer can be created without an options argument', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: { foo: 'bar' }
		});

		ractive.observe( 'foo', ( foo ) => {
			t.equal( foo, 'bar' );
		});
	});

	test( 'Observers fire on init when no matching data', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: {}
		});

		ractive.observe( 'foo', ( foo, old, keypath ) => {
			t.ok( !foo );
			t.equal( keypath, 'foo' );
		});
	});


	test( 'Uninitialised observers do not fire if their keypath is set to the same value', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: { foo: 'bar' }
		});

		ractive.observe( 'foo', () => {
			t.ok( 0 );
		}, { init: false });

		ractive.set( 'foo', 'bar' );
	});

	test( 'Uninitialised observers correctly report initial value on first fire (#1137)', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			data: { foo: 'bar' }
		});

		ractive.observe( 'foo', ( n, o ) => {
			t.equal( o, 'bar' );
			t.equal( n, 'baz' );
		}, { init: false });

		ractive.set( 'foo', 'baz' );
	});

	test( 'Observers fire on downstream changes (#1393)', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { config: { foo: 'bar' } }
		});

		let expected = { foo: 'bar' };

		ractive.observe( 'config', ( n, o, keypath ) => {
			t.deepEqual( n, expected );
			t.equal( keypath, 'config' );
		});

		expected = { foo: 'baz' };
		ractive.set( 'config.foo', 'baz' );
	});

	test( 'Observers do NOT fire on downstream changes with strict: true', t => {
		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { config: { foo: 'bar' } }
		});

		let observed = 0;

		ractive.observe( 'config', () => {
			observed++;
		}, { init: false, strict: true } );

		ractive.set( 'config.foo', 'baz' );

		t.equal( observed, 0 );

		ractive.set( 'config', { foo: 'baz' } );

		t.equal( observed, 1 );
	});

	test( 'Observers can observe multiple keypaths, separated by a space', t => {
		const ractive = new Ractive({
			el: fixture,
			template: 'irrelevant'
		});

		const results = {};

		ractive.observe( 'foo bar baz', ( n, o, k ) => {
			results[ k ] = n;
		});

		ractive.observe({
			'a b': ( n, o, k ) => {
				results[ k ] = n;
			}
		});

		ractive.set( 'foo', 'one' );
		ractive.set({
			bar: 'two',
			baz: 'three'
		});

		ractive.set( 'a', 1 );
		ractive.set( 'b', 2 );

		t.deepEqual( results, { foo: 'one', bar: 'two', baz: 'three', a: 1, b: 2 });
	});

	test( 'Promises from set() operations inside observers resolve (#765)', t => {
		t.expect( 1 );

		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: {
				bar: 1
			}
		});

		ractive.observe( 'bar', () => {
			ractive.set( 'foo', 'works' ).then( () => {
				t.ok( true );
				done();
			});
		}, { init: false });

		ractive.set( 'bar', true );
	});

	test( 'set() operations inside observers affect the DOM immediately (related to #765)', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: {
				bar: 1
			}
		});

		ractive.observe( 'bar', () => {
			ractive.set( 'foo', 'works' );
			t.htmlEqual( fixture.innerHTML, 'works' );
		}, { init: false });

		ractive.set( 'bar', true );
	});

	test( 'Errors inside observers are not caught', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			data: {
				bar: [ 1, 2, 3 ]
			}
		});

		try {
			ractive.observe( 'foo', () => {
				throw new Error( 'test' );
			});
		} catch ( err ) {
			t.equal( err.message, 'test' );
		}

		try {
			ractive.observe( 'bar.*', () => {
				throw new Error( 'test' );
			});
		} catch ( err ) {
			t.equal( err.message, 'test' );
		}
	});

	test( 'Setting up and cancelling a regular observer', t => {
		const ractive = new Ractive({
			el: fixture,
			template: 'unimportant',
			data: {
				person: { name: 'Joe' }
			}
		});

		let dummy = false;
		const observer = ractive.observe( 'person.name', value => dummy = value );

		t.equal( dummy, 'Joe' );

		ractive.set('person.name', 'Londo');
		t.equal( dummy, 'Londo' );

		observer.cancel();
	});

	test( '.observeOnce() functionality', t => {
		t.expect( 1 );

		const ractive = new Ractive({ data: { foo: 'bar' } });

		ractive.observeOnce( 'foo', () => {
			t.ok( true );
		});

		ractive.set( 'foo', 'fizz' );
		ractive.set( 'foo', 'qux' );
	});

	test( 'Observer with no keypath argument (#1868)', t => {
		t.expect( 1 );

		const ractive = new Ractive();

		ractive.observe( data => t.equal( data.answer, 42 ), { init: false });
		ractive.set( 'answer', 42 );
	});

	test( 'Observer with empty string keypath argument (#1868)', t => {
		t.expect( 1 );

		const ractive = new Ractive();

		ractive.observe( '', data => t.equal( data.answer, 42 ), { init: false });
		ractive.set( 'answer', 42 );
	});

	// This is a casualty of 0.8 – the `foo` observer will be called
	// when it turns `false`, immediately before the component that
	// owns the observer is torn down. The observer *is* torn down, though
	test( 'Observers are removed on teardown (#1865)', t => {
		let rendered = 0;
		let observed = 0;

		const Widget = Ractive.extend({
			template: '{{foo}}',
			onrender () {
				rendered += 1;
				this.observe( 'foo', () => observed += 1 );
			}
		});

		const ractive = new Ractive({
			el: fixture,
			template: `{{#if foo}}<Widget foo='{{foo}}'/>{{/if}}`,
			data: { foo: false },
			components: { Widget }
		});

		ractive.toggle( 'foo' );
		t.equal( rendered, 1 );
		t.equal( observed, 1 );

		ractive.toggle( 'foo' );
		t.equal( rendered, 1 );
		t.equal( observed, 2 ); // formerly 1

		ractive.toggle( 'foo' );
		t.equal( rendered, 2 );
		t.equal( observed, 3 ); // formerly 2. (the important thing is it's not 3)
	});

	test( 'Observers should not fire twice when an upstream change is already a change (#1695)', t => {
		let count = 0;

		const ractive = new Ractive({
			data: { items: [] },
			oninit () {
				this.observe( 'items', () => { count++; }, { init: false } );
			}
		});

		ractive.set( 'items', [ 1 ], { shuffle: true } );

		t.equal( count, 1 );
	});

	test( 'Pattern observers fire on changes to keypaths that match their pattern', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { foo: { bar: { baz: 1 } } }
		});

		let expected = 1;

		ractive.observe( 'foo.bar.*', ( n, o, keypath ) => {
			t.equal( n, expected );
			t.equal( keypath, 'foo.bar.baz' );
		});

		expected = 2;
		ractive.set( 'foo.bar.baz', expected );
	});

	// TODO why not deletes? was this discussed?
	test( 'Pattern observers fire on changes and adds, but not deletes', t => {
		let newName;
		let oldName;
		let keypath;
		let index;
		let observed = 0;

		const ractive = new Ractive({
			data: { fruits: [
				{ name: 'apple' },
				{ name: 'orange' },
				{ name: 'banana' }
			]},
			oninit () {
				this.observe( 'fruits.*.name', ( n, o, k, i ) => {
					observed++;
					newName = n;
					oldName = o;
					keypath = k;
					index = i;
				}, { init: false } );
			}
		});

		ractive.splice( 'fruits', 1, 2, { name: 'pear' } );
		t.equal( observed, 1 );
		t.equal( newName, 'pear' );
		t.equal( oldName, 'orange' );
		t.equal( keypath, 'fruits.1.name' );
		t.equal( index, 1 );
	});

	test( 'Pattern observers fire on adds and changes in full array set', t => {
		let observed = 0;

		const ractive = new Ractive({
			data: { fruits: [ 'apple', 'orange', 'banana' ] },
			oninit () {
				this.observe( 'fruits.*', () => {
					observed++;
				}, { init: false } );
			}
		});

		ractive.set( 'fruits', [ 'apple', 'mango', 'banana', 'pear' ] );
		t.equal( observed, 2 );
	});

	test( 'Pattern observers do NOT fire on init when no matching data', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: {}
		});

		ractive.observe( '*', () => {
			t.ok( true );
		});
	});

	test( 'Pattern observers fire on changes to keypaths downstream of their pattern', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { foo: { bar: { baz: 1 } } }
		});

		let expected = { baz: 1 };

		ractive.observe( 'foo.*', ( n, o, keypath ) => {
			t.deepEqual( n, expected );
			t.equal( keypath, 'foo.bar' );
		});

		expected = { baz: 2 };
		ractive.set( 'foo.bar.baz', 2 );
	});


	test( 'observe has correct context #2087', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { foo: { bar: { baz: 1 } } }
		});

		ractive.observe( 'foo.*', function () {
			t.ok( this === window );
		}, { context: window });

		ractive.observe( 'foo', function () {
			t.ok( this === window );
		}, { context: window });

		ractive.set( 'foo.bar.baz', 2 );
	});


	test( 'Pattern observers fire on changes to keypaths upstream of their pattern', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { foo: { bar: { baz: 1 } } }
		});

		let expected = 1;

		ractive.observe( 'foo.*.baz', ( n, o, keypath ) => {
			t.deepEqual( n, expected );
			t.equal( keypath, 'foo.bar.baz' );
		});

		expected = 2;
		ractive.set( 'foo', { bar: { baz: 2 } });
	});

	test( 'Pattern observers fire on changes to keypaths upstream of their pattern only if their value has changed', t => {
		t.expect( 7 );

		let foo = { bar: { baz: 1 } };

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { foo }
		});

		ractive.observe( 'foo', n => {
			t.equal( n, foo, 'foo observer' );
		});

		let expected = 1;

		ractive.observe( 'foo.*.baz', ( n, o, keypath ) => {
			t.deepEqual( n, expected, 'foo.*.baz observer' );
			t.equal( keypath, 'foo.bar.baz', 'keypath' );
		});

		foo = { bar: { baz: 1 } };
		// this won't fire 'foo.*.baz' because baz === 1
		ractive.set( 'foo', foo );

		expected = 2;

		foo = { bar: { baz: 2 } };
		ractive.set( 'foo', foo );
	});

	test( 'Pattern observers can have multiple wildcards', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { foo: { bar: { baz: 1 } } }
		});

		let expected = 1;

		ractive.observe( 'foo.*.*', ( n, o, keypath ) => {
			t.deepEqual( n, expected );
			t.equal( keypath, 'foo.bar.baz' );
		});

		expected = 2;
		ractive.set( 'foo.bar', { baz: 2 });
	});

	test( 'The first key in a pattern observer\'s pattern can be a wildcard', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: 'blah',
			data: { gup: { foo: { bar: { baz: 1 } } } }
		});

		let expected = 1;

		ractive.observe( 'gup.*.bar.baz', ( n, o, keypath ) => {
			t.deepEqual( n, expected );
			t.equal( keypath, 'gup.foo.bar.baz' );
		});

		expected = 2;
		ractive.set( 'gup.foo.bar', { baz: 2 });
	});

	test( 'Pattern observers fire when ractive.update() is called without parameters', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: 'whatever',
			data: { items: [ 'a', 'b', 'c' ] }
		});

		ractive.observe( 'items.*', ( n, o, k ) => {
			t.equal( k, 'items.1' );
			t.equal( n, 'd' );
		}, { init: false });

		ractive.get( 'items' )[1] = 'd';
		ractive.update();
	});

	test( 'Pattern observers can start with wildcards (#629)', t => {
		const ractive = new Ractive({
			data: {
				foo: { number: 0 },
				bar: { number: 1 },
				baz: { number: 2 }
			}
		});

		const values = {};

		ractive.observe( '*.number', ( n, o, k ) => {
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

	test( 'Pattern observers on arrays fire correctly after mutations', t => {
		const ractive = new Ractive({
			data: {
				items: [ 'a', 'b', 'c' ]
			}
		});

		let lastKeypath;
		let lastValue;
		let observedLengthChange = false;

		ractive.observe( 'items.*', ( n, o, k ) => {
			lastKeypath = k;
			lastValue = n;

			if ( k === 'items.length' ) {
				observedLengthChange = true;
			}
		}, { init: false } );

		ractive.push( 'items', 'd' );
		t.equal( lastKeypath, 'items.3' );
		t.equal( lastValue, 'd' );

		lastKeypath = void 0;
		lastValue = void 0;

		ractive.pop( 'items' );
		t.equal( lastKeypath, undefined );
		t.equal( lastValue, undefined );

		t.ok( !observedLengthChange );

		ractive.set( 'items.length', 4 );
		t.ok( observedLengthChange );
	});

	test( 'Pattern observers receive additional arguments corresponding to the wildcards', t => {
		const ractive = new Ractive({
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

		let lastIndex;
		let lastA;
		let lastB;

		ractive.observe({
			'array.*' ( n, o, k, index ) {
				lastIndex = index;
			},
			'object.*.*' ( n, o, k, a, b ) {
				lastA = a;
				lastB = b;
			}
		}, { init: false });

		ractive.push( 'array', 'd' );
		t.equal( lastIndex, 3 );

		ractive.set( 'object.foo.five', 5 );
		t.equal( lastA, 'foo' );
		t.equal( lastB, 'five' );
	});

	test( 'Pattern observers work with an empty array (#760)', t => {
		const ractive = new Ractive({});
		ractive.observe( 'foo.*.bar', () => {});
		t.ok( true );
	});

	test( 'Pattern observers work with an property of array (#760) variant', t => {
		t.expect( 2 );

		const ractive = new Ractive({ data: { foo: [] } } );
		const bar = { bar: 1 };

		ractive.observe('foo.*.bar', ( n, o, k ) => {
			t.equal( n, 1 );
			t.equal( k, 'foo.0.bar' );
		});

		ractive.push( 'foo', bar );
	});

	test( 'Setting up and cancelling a pattern observer', t => {
		const ractive = new Ractive({
			el: fixture,
			template: 'unimportant',
			data: {
				person: { name: 'Joe' }
			}
		});

		let dummy = false;
		const observer = ractive.observe( 'person.*', value => dummy = value );

		t.equal( dummy, 'Joe' );

		ractive.set( 'person.name', 'Londo' );
		t.equal( dummy, 'Londo' );

		observer.cancel();
	});

	test( 'Deferred pattern observers work correctly (#1079)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: 'unimportant',
			data: {
				fruits : ['apple','banana','orange']
			}
		});

		const dummy = [];
		const observer = ractive.observe( 'fruits.*', fruit => {
			dummy.push( fruit );
		}, { defer: true });

		t.deepEqual( dummy, [ 'apple', 'banana', 'orange' ] );

		ractive.push( 'fruits', 'cabbage' );
		t.deepEqual( dummy, [ 'apple', 'banana', 'orange', 'cabbage' ] );

		observer.cancel();
	});

	test( 'Asterisks should not be left in computation keypaths (#1472)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{foo * 2}}',
			data: { foo: 3 }
		});

		ractive.observe( '*', () => {} );

		// this will blow the stack if the bug is present
		// qunit doesn't like it when your tests straight-up overflow
		// the try helps, but it will still cascade to other tests
		try {
			ractive.set( 'foo', 10 );
		} catch ( err ) {
			// do nothing
		}

		t.htmlEqual( fixture.innerHTML, '20' );
	});

	// phantomjs, IE8...
	try {
		fire( document.createElement( 'div' ), 'input' );
		fire( document.createElement( 'div' ), 'blur' );

		test( 'Pattern observers used as validators behave correctly on blur (#1475)', t => {
			const ractive = new Ractive({
				el: fixture,
				template: `
					{{#each items}}
						<input value='{{value}}'>{{value}}
					{{/each}}`,
				data: {
					items: [
						{ min: 10, max: 90, value: 0 },
						{ min: 10, max: 90, value: 100 }
					]
				}
			});

			ractive.observe( 'items.*.value', function ( n, o, k, i ) {
				const min = this.get( 'items[' + i + '].min' );
				const max = this.get( 'items[' + i + '].max' );

				if ( n < min ) this.set( k, min );
				if ( n > max ) this.set( k, max );
			});

			t.equal( ractive.get( 'items[0].value' ), 10 );
			t.equal( ractive.get( 'items[1].value' ), 90 );

			const inputs = ractive.findAll( 'input' );

			inputs[0].value = 200;
			inputs[1].value = -200;

			fire( inputs[0], 'input' );
			fire( inputs[1], 'input' );

			fire( inputs[0], 'blur' );
			fire( inputs[1], 'blur' );

			t.equal( ractive.get( 'items[0].value' ), 90 );
			t.equal( ractive.get( 'items[1].value' ), 10 );
		});
	} catch ( err ) {
		// do nothing
	}

	test( 'Observer fires on initialisation for computed properties', t => {
		const ractive = new Ractive({
			data: { num: 21 },
			computed: {
				doubled: '${num}*2'
			}
		});

		const observed = {};

		ractive.observe( '*', ( n, o, k ) => {
			observed[k] = n;
		});

		t.deepEqual( observed, { num: 21, doubled: 42 });
	});

	test( `observers that cause a shuffle shouldn't throw (#2222)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `-{{#each items}}{{.}}{{/each}}
				{{#each watches}}{{.}}{{/each}}`,
			data: {
				items: [],
				watches: []
			},
			oninit() {
				this.observe( 'items.*', ( n, o, k ) => {
					this.push( 'watches', `${n} - ${k} ` );
				});
			}
		});

		r.push( 'items', 1, 2 );
		t.htmlEqual( fixture.innerHTML, '-12 1 - items.0 2 - items.1' );
	});

	test( `a pattern observer that is shuffled with objects should only notify on the new keys`, t => {
		let count = 0;

		const r = new Ractive({
			el: fixture,
			template: '',
			data: {
				items: [ { val: 1 } , { val: 2 } ]
			},
			oninit() {
				this.observe( 'items.*', () => {
					count++;
				});
			}
		});

		t.equal( count, 2 );
		r.push( 'items', { val: 3 } );
		t.equal( count, 3 );
		r.unshift( 'items', { val: 0 } );
		t.equal( count, 7 );
	});

	test( `wildcard * and root fire in components for mapped and local data`, t => {
		t.expect(16);

		let wckeypath = 'value';
		let wcexpect = 'foo';
		let rootexpect = { value: 'foo' };

		const widget = Ractive.extend({
			oninit () {
				this.observe( '*', ( n, o, k ) => {
					t.equal( n, wcexpect, 'wildcard value' );
					t.equal( k, wckeypath, 'wildcard keypath' );
				});

				this.observe( ( n, o, k ) => {
					t.deepEqual( n, rootexpect, 'root value' );
					t.equal( k, '', 'root keypath' );
				});
			}
		});

		const r = new Ractive({
			el: fixture,
			template: `<widget value='{{foo}}'/>`,
			data: {
				foo: 'foo'
			},
			components: { widget }
		});

		wcexpect = 'bar';
		rootexpect = { value: 'bar' };
		r.set( 'foo', 'bar' );

		wcexpect = 'qux';
		rootexpect = { value: 'qux' };
		r.findComponent( 'widget' ).set( 'value', 'qux' );

		wckeypath = 'bizz';
		wcexpect = 'buzz';
		rootexpect = { value: 'qux', bizz: 'buzz' };
		r.findComponent( 'widget' ).set( 'bizz', 'buzz' );
	});

	test( 'wildcard * and root include computed but not expressions', t => {
		let wildcard = 0;
		let root = 0;

		new Ractive({
			el: fixture,
			template: `{{ foo + 2 }}`,
			data: { foo: 1 },
			computed: { bar: '${foo} + 1'},
			oninit () {
				this.observe( '*', ( n, o, k ) => {
					t.ok( k[0] !== '@' );
					wildcard++;
				});

				this.observe( ( n, o, k ) => {
					t.ok( k[0] !== '@' );
					root++;
				});
			}
		});

		t.equal( wildcard, 2, 'wildcard count' );
		t.equal( root, 1, 'root count' );
	});

	test( 'Pattern observer expects * to only apply to arrays and objects (#1923)', t => {
		t.expect(0);
		const ractive = new Ractive({
			data: { msg: 'hello world' }
		});

		ractive.observe( 'msg.*', () => {
			t.ok( false, 'observer should not fire' );
		});
	});

	test( 'pattern observers only observe changed values (#2420)', t => {
		t.expect( 3 );

		const r = new Ractive({
			data: {
				list: [ { foo: 1 }, { foo: 2 } ]
			}
		});

		r.observe( 'list.*', ( n, o, k ) => {
			t.equal( k, 'list.1' );
			t.deepEqual( o, { foo: 2 } );
			t.deepEqual( n, { foo: 'yep' } );
		}, { init: false });

		r.set( 'list.1', { foo: 'yep' } );
	});

	test( 'pattern observers only observe changed values with exact keypath matches (#2420)', t => {
		t.expect( 3 );

		const r = new Ractive({
			data: {
				list: [ { foo: {} }, { foo: 2 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {} ]
			}
		});

		r.observe( 'list.*', ( n, o, k ) => {
			t.equal( k, 'list.1' );
			t.deepEqual( o, { foo: 'yep' } );
			t.deepEqual( n, { foo: 'yep' } );
		}, { init: false });

		r.set( 'list.1.foo', 'yep' );
	});

	test( 'subsequent single segment pattern observers still have the correct old value', t => {
		t.expect( 6 );
		let str = 'yep';

		const r = new Ractive({
			data: {
				list: [ { foo: {} }, { foo: 2 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {} ]
			}
		});

		r.observe( 'list.*', ( n, o ) => {
			t.deepEqual( o, { foo: str } );
			t.deepEqual( n, { foo: str } );
		}, { init: false });

		r.set( 'list.1.foo', str );
		r.set( 'list.0.foo', str );
		str = 'ha';
		r.set( 'list.0.foo', str );
	});

	test( 'pattern observers only observe changed values on update', t => {
		t.expect( 2 );

		const r = new Ractive({
			data: {
				list: [ { foo: 1 }, { foo: 2 } ]
			}
		});

		r.observe( 'list.*', ( n, o, k ) => {
			t.equal( k, 'list.1' );
			t.deepEqual( n, { foo: 'yep' } );
		}, { init: false });

		r.get( 'list.1' ).foo = 'yep';
		r.update( 'list.1.foo' );
	});

	test( `pattern observer doesn't die on primitive values (#2503)`, t => {
		const done = t.async();
		const r = new Ractive({
			el: fixture,
			template: '',
			data: { foo: 0 }
		});

		r.observe( '* *.*', (n, o, k) => {
			t.equal( n, 1 );
			t.equal( o, 0 );
			t.equal( k, 'foo' );
			done();
		}, { init: false });

		r.add( 'foo' );
	});

	test( 'wildcard * fires on new property', t => {
		t.expect( 2 );

		const ractive = new Ractive({ data: { qux: 'qux' } });

		ractive.observe( '*', ( n, o, k ) => {
			t.equal( k, 'foo' );
			t.equal( n, 'bar' );
		}, { init: false} );

		ractive.set( 'foo', 'bar' );
	});

	test( 'References to observers are not retained after cancel()', t => {
		const ractive = new Ractive({ data: { counter: 0 } });
		const obs = ractive.observe( 'counter', ( newValue, oldValue ) => {
			if ( oldValue ) {
				return obs.cancel();
			}
		});

		t.equal( ractive._observers.length, 1 );

		ractive.add( 'counter' );
		obs.cancel();

		t.equal( ractive._observers.length, 0 );
	});

	test( 'observers on implicit mappings should resolve correctly (#2572)', t => {
		t.expect( 2 );

		let count = 0;
		const cmp = Ractive.extend({
			oninit () {
				this.observe( this.get( 'target' ), n => {
					if ( count ) {
						t.equal( n, 1 );
					} else {
						count++;
						t.equal( n, 0 );
					}
				});
			},
			isolated: false
		});

		const r = new Ractive({
			el: fixture,
			template: '<cmp target="foo.bar" />',
			data: {
				foo: { bar: 0 }
			},
			components: { cmp }
		});

		r.add( 'foo.bar' );
	});

	test( 'observing in an isolated component should not create implicit mappings', t => {
		t.expect( 0 );

		const cmp = Ractive.extend({
			oninit () {
				this.observe( 'foo.bar', () => t.ok( false ) );
			},
			isolated: true
		});

		const r = new Ractive({
			el: fixture,
			data: {
				foo: { bar: 0 }
			},
			components: { cmp }
		});

		r.add( 'foo.bar' );
	});

	test( 'observers should not be re-entrant when they init (#2594)', t => {
		let count = 0;
		new Ractive({
			el: fixture,
			data: { list: [ 0, 0 ] },
			oninit () {
				this.observe( 'list', () => {
					count++;
					this.set( 'list', [] );
				});
			}
		});

		t.equal( count, 1 );
	});

	test( 'pattern observers should not be re-entrant when they init', t => {
		let count = 0;
		new Ractive({
			el: fixture,
			data: { obj: { list: [ 0, 0 ] } },
			oninit () {
				this.observe( 'obj.*', ( n, o, k ) => {
					count++;
					this.set( k, [] );
				});
			}
		});

		t.equal( count, 1 );
	});

	test( 'pattern observers handle multi-key set correctly (#2631)', t => {
		const list = [];
		const r = new Ractive({
			data: {
				list: [ { a: 1 }, { a: 2 }, { a: 3 } ]
			},
			onconfig () {
				this.observe( 'list.*.a', (n, o, k, i) => {
					list[i] = n;
				});
			}
		});

		t.deepEqual( list, [ 1, 2, 3 ] );
		r.set({
			'list.0.a': 3,
			'list.1.a': 4,
			'list.2.a': 5
		});
		t.deepEqual( list, [ 3, 4, 5 ] );
	});

	test( `observers only fire for a computation when it actually changes (#2629)`, t => {
		const r = new Ractive({
			computed: {
				int () {
					return Math.round( this.get( 'number' ) );
				}
			},
			data: {
				number: 1,
				observerCalledTimes: 0
			}
		});

		r.observe( 'int', function () {
			this.add( 'observerCalledTimes', 1 );
		});

		r.set( 'number', 1.1 );
		r.set( 'number', 1.2 );
		r.set( 'number', 1.3 );
		r.set( 'number', 1.4 );

		t.equal( r.get( 'observerCalledTimes' ), 1 );
	});

	test( 'observers on conditional mappings fire correctly (#2636)', t => {
		let val;

		const cmp = Ractive.extend({
			oninit () {
				this.observe( 'bar', v => val = v );
			}
		});

		const r = new Ractive({
			el: fixture,
			template: '<cmp {{#if baz}}bar="{{baz}}"{{/if}} />',
			data: { baz: '' },
			components: { cmp }
		});

		r.set( 'baz', 'hello' );
		t.equal( val, 'hello' );
	});

	test( `observers on ambiguous paths should not cause errors if they don't resolve before teardown (#2619)`, t => {
		const r = new Ractive({
			el: fixture,
			onconfig () {
				this.observe( 'foo', () => {}, { init: false } );
			}
		});

		try {
			r.teardown();
			t.equal( fixture.innerHTML, '' );
		} catch (e) {
			t.ok( false, e.message );
		}
	});

	test( `observers that modify their observed keypath should fire again when set to the pre-observed value (#2668)`, t => {
		let count = 0;

		const r = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: { foo: 'hello' }
		});

		r.observe( 'foo', function(v, o, k) {
			count++;
			this.set( k, v + '1' );
		}, { init: false });

		t.htmlEqual( fixture.innerHTML, 'hello' );
		r.set( 'foo', 'hello' );
		t.htmlEqual( fixture.innerHTML, 'hello' );
		r.set( 'foo', 'yep' );
		t.htmlEqual( fixture.innerHTML, 'yep1' );
		r.set( 'foo', 'yep' );
		t.htmlEqual( fixture.innerHTML, 'yep1' );
		t.equal( count, 2 );
	});

	test( `observers fire properly on upstream links (#2675)`, t => {
		let count = 0;
		const cmp = Ractive.extend({
			template: '{{ JSON.stringify(obj) }}',
			onrender () {
				this.observe( 'obj', () => count++, { init: false } );
			}
		});

		const r = new Ractive({
			el: fixture,
			template: '{{ JSON.stringify(src) }}<cmp obj="{{src}}" />',
			data: {
				src: { str: 'yep' }
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '{"str":"yep"}{"str":"yep"}' );
		r.set( 'src.str', 'still yep' );
		t.equal( count, 1 );
		t.htmlEqual( fixture.innerHTML, '{"str":"still yep"}{"str":"still yep"}' );
	});

	test( `pattern observers fire properly on upstream links (#2675)`, t => {
		let val;
		let path;
		let key;

		const cmp = Ractive.extend({
			template: '{{ JSON.stringify(obj) }}',
			onrender () {
				this.observe( 'obj.*', ( v, o, k, p ) => {
					val = v;
					path = k;
					key = p;
				}, { init: false } );
			}
		});

		const r = new Ractive({
			el: fixture,
			template: '{{ JSON.stringify(src) }}<cmp obj="{{src}}" />',
			data: {
				src: { str: 'yep' }
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '{"str":"yep"}{"str":"yep"}' );
		r.set( 'src.str', 'still yep' );
		t.equal( val, 'still yep' );
		t.equal( path, 'obj.str' );
		t.equal( key, 'str' );
		t.htmlEqual( fixture.innerHTML, '{"str":"still yep"}{"str":"still yep"}' );
	});

	test( `observers fire properly on upstream linked links (#2675)`, t => {
		let count = 0;
		const cmp2 = Ractive.extend({
			template: '{{ JSON.stringify(obj) }}',
			onrender () {
				this.observe( 'obj', () => count++, { init: false } );
			}
		});

		const cmp1 = Ractive.extend({
			template: '<cmp2 obj="{{middle}}" />',
			components: { cmp2 }
		});

		const r = new Ractive({
			el: fixture,
			template: '{{ JSON.stringify(src) }}<cmp1 middle="{{src}}" />',
			data: {
				src: { str: 'yep' }
			},
			components: { cmp1 }
		});

		t.htmlEqual( fixture.innerHTML, '{"str":"yep"}{"str":"yep"}' );
		r.set( 'src.str', 'still yep' );
		t.equal( count, 1 );
		t.htmlEqual( fixture.innerHTML, '{"str":"still yep"}{"str":"still yep"}' );
	});

	test( `pattern observers only fire once for matching keypaths (#2682)`, t => {
		let count = 0;
		const r = new Ractive({
			el: fixture
		});

		r.observe( 'a.*.c.*', () => {
			count++;
			r.set( 'a.b.really.d', 1 );
		});

		r.set( 'a.b.c.d', 1 );
		r.set( 'a.b.nope.d', 1 );

		t.equal( count, 1 );
	});

	test( 'observe ignores additional empty paths (#2690)', t => {
		let count1 = 0;
		let count2 = 0;
		const r = new Ractive({
			el: fixture
		});

		r.observe( 'a ', () => count1++, { init: false } );
		r.observe({
			'a ': () => count2++
		}, { init: false });

		r.set( 'a', 1 );
		t.equal( count1, 1 );
		t.equal( count2, 1 );
	});

	test( `observeOnce works from the config event, even if the data is initialized - #2725`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			onconfig () {
				this.observeOnce( 'foo', () => count++ );
				this.set( 'foo', 'yep' );
			}
		});

		t.equal( count, 1 );

		r.set( 'foo', 'bar' );
		t.equal( count, 1 );
	});

	test( `observers can be silenced and resumed`, t => {
		let count = 0;
		const r = new Ractive();
		const handle = r.observe( 'foo', function () {
			t.ok( this === r );
			count++;
		}, { init: false });

		r.toggle( 'foo' );
		t.equal( count, 1 );

		handle.silence();
		r.toggle( 'foo' );
		t.equal( count, 1 );
		t.equal( handle.isSilenced(), true );

		handle.resume();
		r.toggle( 'foo' );
		t.equal( count, 2 );
		t.equal( handle.isSilenced(), false );
	});

	test( `observer handle cancels all observers when multiple observers are created`, t => {
		let count = 0;
		const r = new Ractive();
		const handle = r.observe( 'foo bar baz', () => count++, { init: false } );

		r.toggle( 'foo' );
		r.toggle( 'bar' );
		t.equal( count, 2 );

		handle.cancel();

		r.toggle( 'bar' );
		t.equal( count, 2 );
	});

	test( `pattern observer only fires a partial update once (#2800)`, t => {
		const counts = { a: 0, b: 0 };
		const r = new Ractive();
		r.observe( 'foo.*', ( n, o, kp, k ) => {
			counts[k]++;
			if ( k === 'a' ) r.set( 'foo.b', 'changed' );
		}, { init: false });

		r.set( 'foo.a', 'yep' );

		t.equal( counts.a, 1 );
		t.equal( counts.b, 1 );
	});

	test( `pattern observer only fires for an exactly matching keypath, not just a partial match (#2805)`, t => {
		const keys = [];
		const r = new Ractive({ data: { foo: [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {} ] } });
		r.observe('foo.*', ( n, o, kp, k ) => {
			keys.unshift(k);
		}, { init: false });

		r.set( 'foo.10.bar', 'a' );
		t.equal( keys.length, 1 );
		t.equal( keys[0], '10' );

		r.set( 'foo.20.bar', 'b' );
		t.equal( keys.length, 2 );
		t.equal( keys[0], '20' );
	});

	test( `inserting array elements without using modification methods should still mark length (#2806)`, t => {
		const r = new Ractive({
			data: { foo: [] }
		});
		let val = 0;
		r.observe( 'foo.length', v => t.equal( v, val ) );

		val = 1;
		r.set( 'foo.0', 'a' );

		val = 7;
		r.set( 'foo.6', 'b' );
	});

	test( 'List observers report array modifications', t => {
		let shuffle;

		const ractive = new Ractive({
			data: { fruits: [ 'apple', 'orange', 'banana' ] },
			oninit () {
				this.observe( 'fruits', ( shfl ) => {
					shuffle = shfl;
				}, { array: true });
			}
		});

		t.deepEqual( shuffle.inserted, [ 'apple', 'orange', 'banana' ] );
		t.deepEqual( shuffle.deleted, [] );
		t.ok( !shuffle.start );

		ractive.splice( 'fruits', 1, 2, 'pear' );

		t.deepEqual( shuffle.inserted, [ 'pear' ] );
		t.deepEqual( shuffle.deleted, [ 'orange', 'banana' ] );
		t.equal( shuffle.start, 1 );
	});

	test( 'List observers correctly report value change on no init', t => {
		let shuffle;

		const ractive = new Ractive({
			data: { fruits: [ 'apple', 'orange', 'banana' ] },
			oninit () {
				this.observe( 'fruits', ( shfl ) => {
					shuffle = shfl;
				}, { init: false, array: true } );
			}
		});

		ractive.splice( 'fruits', 1, 2, 'pear' );

		t.deepEqual( shuffle.inserted, [ 'pear' ] );
		t.deepEqual( shuffle.deleted, [ 'orange', 'banana' ] );
		t.equal( shuffle.start, 1 );
	});

	test( 'List observers report full array value changes as inserted/deleted', t => {
		let shuffle;

		const ractive = new Ractive({
			data: { fruits: [ 'apple', 'orange', 'banana' ] },
			oninit () {
				this.observe( 'fruits', ( shfl ) => {
					shuffle = shfl;
				}, { init: false, array: true } );
			}
		});

		ractive.set( 'fruits', [ 'pear', 'mango' ] );

		t.deepEqual( shuffle.inserted, [ 'pear', 'mango' ] );
		t.deepEqual( shuffle.deleted, [ 'apple', 'orange', 'banana' ] );
	});

	test( 'Pattern observers on arrays fire correctly after mutations', t => {
		const ractive = new Ractive({
			data: {
				items: [ 'a', 'b', 'c' ]
			}
		});

		let index;
		let deleted;
		let inserted;

		ractive.observe( 'items', shuffle => {
			index = shuffle.start;
			inserted = shuffle.inserted;
			deleted = shuffle.deleted;
		}, { init: false, array: true });

		ractive.push( 'items', 'd' );
		t.equal( index, '3' );
		t.equal( deleted[0], undefined );
		t.equal( inserted[0], 'd' );

		ractive.pop( 'items' );
		t.equal( index, '3' );
		t.equal( inserted[0], undefined );
		t.equal( deleted[0], 'd' );
	});

	test( 'array observers can be single fire', t => {
		let count = 0;
		const r = new Ractive({
			observe: {
				list: {
					array: true,
					once: true,
					handler () { count++; }
				}
			},
			data: { list: [] }
		});

		r.push( 'list', 1 );
		r.push( 'list', 1 );

		t.equal( count, 1 );
	});

	test( 'array observers can be deferred', t => {
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: '{{#each list}}<span />{{/each}}',
			data: { list: [] },
			observe: {
				list: {
					array: true,
					defer: true,
					init: false,
					handler () { t.equal( r.findAll( 'span' ).length, 1 ); }
				}
			}
		});
		r.observe( 'list', () => t.equal( r.findAll( 'span' ).length, 0 ), { init: false, array: true } );

		r.push( 'list', 1 );
	});

	test( `plain observers allow a hook to set the 'old' value`, t => {
		t.expect( 4 );

		let target = 0;
		const r = new Ractive({
			data: { list: [] },
			observe: {
				list: {
					init: false,
					handler ( v, o ) {
						t.equal( o.length, target );
						t.equal( v.length, target + 1 );
					},
					old ( o, n ) { return n.slice(); }
				}
			}
		});

		r.push( 'list', 1 );
		target = 1;
		r.push( 'list', 1 );
	});

	test( `plain observer old value hook gets a lifelong context on top of the ractive instance`, t => {
		t.expect( 3 );

		const r = new Ractive({
			data: { foo: '', bar: '' },
			observe: {
				foo: {
					init: false,
					handler ( v, o ) {
						t.ok( o === '' && v !== o, 'old value is empty string and new is ' + v );
					},
					old ( o, n ) {
						if ( !this.hasOwnProperty( 'old' ) ) this.old = n;
						return this.old;
					}
				},
				bar: {
					init: false,
					handler () {},
					old ( o, n ) {
						if ( n !== '' ) return;
						t.ok( typeof this.set === 'function', 'context has a set method' );
						this.set( 'foo', 'yep' );
					}
				}
			}
		});

		r.set( 'bar', '?' );
		r.set( 'foo', 'asdf' );
	});

	test( `recursive observers from root`, t => {
		const r = new Ractive();
		const vals = [
			[ { baz: 'yep' }, undefined, 'foo.bar' ],
			[ 'still', undefined, 'foo.bar.baz' ],
			[ { bar: 'yep' }, undefined, 'foo' ],
			[ { bar: { baz: '' } }, { bar: 'yep' }, 'foo' ],
			[ 'yep again', 'still', 'foo.bar.baz' ]
		];
		r.observe( '**', ( v, o, k ) => {
			const target = vals.shift();
			[ v, o, k ].forEach( ( p, i ) => t.deepEqual( p, target[i] ) );
		});

		r.set( 'foo.bar', { baz: 'yep' } );
		r.set( 'foo.bar.baz', 'still' );
		r.set( 'foo', { bar: 'yep' } );
		r.set( 'foo', { bar: { baz: '' } } );
		r.set( 'foo.bar.baz', 'yep again' );
	});

	test( `recursive observers from path`, t => {
		const r = new Ractive();
		const vals = [
			[ { baz: 'yep' }, undefined, 'some.path.foo.bar', 'foo.bar' ],
			[ 'still', undefined, 'some.path.foo.bar.baz', 'foo.bar.baz' ],
			[ { bar: 'yep' }, undefined, 'some.path.foo', 'foo' ],
			[ { bar: { baz: '' } }, { bar: 'yep' }, 'some.path.foo', 'foo' ],
			[ 'yep again', 'still', 'some.path.foo.bar.baz', 'foo.bar.baz' ]
		];
		r.observe( 'some.path.**', ( v, o, k, w ) => {
			const target = vals.shift();
			[ v, o, k, w ].forEach( ( p, i ) => t.deepEqual( p, target[i] ) );
		});

		r.set( 'some.path.foo.bar', { baz: 'yep' } );
		r.set( 'some.path.foo.bar.baz', 'still' );
		r.set( 'some.path.foo', { bar: 'yep' } );
		r.set( 'some.path.foo', { bar: { baz: '' } } );
		r.set( 'some.path.foo.bar.baz', 'yep again' );
		r.set( 'not.relevant', 'yep' );
	});

	test( `recursive observers and links`, t => {
		const r = new Ractive({
			target: fixture,
			template: '<cmp foozle="{{thing}}" />',
			components: { cmp: Ractive.extend() },
			data: { thing: {} }
		});

		const cmp = r.findComponent( 'cmp' );

		const ob1 = cmp.observe( '**', () => t.ok( false, 'should not fire' ), { init: false, links: false } );
		const ob2 = cmp.observe( '**', ( v, o, k ) => {
			t.equal( v, 'yep' );
			t.equal( k, 'foozle.foo' );
		}, { init: false, links: true } );
		r.set( 'thing.foo', 'yep' );
		r.set( 'other', 'nope' );
		ob1.cancel();
		ob2.cancel();
	});

	test( `recursive observers catch changes on a root of link (#2862)`, t => {
		t.expect( 12 );

		const src = new Ractive({
			data: { bar: 'yep' }
		});
		const dest = new Ractive({});

		let vv, oo;
		let kk = 'other.bar';
		let count = 0;
		dest.observe( '**', ( v, o, k ) => {
			t.ok( v === vv, o === oo, k === kk );
			count++;
		}, { init: false, links: true });

		dest.observe( 'other.**', ( v, o, k ) => {
			t.ok( v === 'yep' && o === undefined && k === 'other.bar' );
		}, { init: false, links: true });
		vv = 'yep';
		oo = undefined;
		dest.link( 'bar', 'other.bar', { ractive: src } );

		kk = 'link.foo';
		vv = undefined;
		oo = undefined;
		dest.link( 'foo', 'link.foo', { ractive: src } );
		t.equal( dest.get( 'link.foo' ), vv );

		vv = 'a';
		src.set( 'foo', 'a' );
		t.equal( dest.get( 'link.foo' ), vv );

		vv = 'c';
		oo = 'a';
		dest.set( 'link.foo', 'c' );
		t.equal( src.get( 'foo' ), 'c' );

		oo = 'c';
		vv = 'b';
		src.set( 'foo', 'b' );
		t.equal( dest.get( 'link.foo' ), vv );

		oo = 'b';
		vv = undefined;
		dest.unlink( 'link.foo' );
		t.equal( dest.get( 'link.foo' ), vv );

		t.equal( count, 5 );
	});

	test( `observers can be created outside of a runloop e.g. oninit (#2960)`, t => {
		t.expect( 5 );

		new Ractive({
			target: fixture,
			template: '{{expr}} {{foo}}',
			oninit () {
				this.observe( '*', () => t.ok( this.set( 'foo', 'here' ) ), { defer: true });
				this.observe( '*', () => t.ok( true ), { defer: true });
			},
			data: {
				foo: ''
			},
			computed: {
				expr: '${foo}'
			}
		});
	});

	test( `pattern observers see new values when partial changes happen at the same time (#2984)`, t => {
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: '{{#each items}}<input bind-value=".id" />{{/each}}',
			data: {
				items: [
					{ name: 'Frank', id: '42' }
				]
			}
		});

		let expected;
		r.observe( 'items.*.name', v => {
			t.ok( v === expected );
		}, { init: false });

		expected = 'Joe';
		r.push( 'items', { name: 'Joe' } );

		expected = 'Larry';
		r.push( 'items', { name: 'Larry' } );
	});

	test( `pattern observers with multiple wildcards and an array base work`, t => {
		t.expect( 3 );

		const r = new Ractive({
			data: { items: [] }
		});

		let expected = '';
		let next = '';
		r.observe( 'items.*.list.*.name', v => {
			t.ok( v === expected );
			expected = next;
		}, { init: false });

		expected = 'apple';
		r.push( 'items', { list: [ { name: 'apple' } ] });

		next = 'apple';
		expected = 'banana';
		r.unshift( 'items', { list: [ { name: 'banana' } ] } );
	});
}
