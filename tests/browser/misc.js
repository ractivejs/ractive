import { fire } from 'simulant';
import { hasUsableConsole, onWarn, initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'misc.js' );

	test( 'Subclass instance data extends prototype data', t => {
		const Subclass = Ractive.extend({
			template: '{{foo}} {{bar}}',
			data: { foo: 1 }
		});

		const instance = new Subclass({
			el: fixture,
			data: { bar: 2 }
		});

		t.htmlEqual( fixture.innerHTML, '1 2' );
		t.deepEqual( instance.get(), { foo: 1, bar: 2 });
	});

	test( 'Subclasses of subclasses inherit data, partials and transitions', t => {
		let wiggled;
		let shimmied;

		const Subclass = Ractive.extend({
			template: '<div wiggle-in>{{>foo}}{{>bar}}{{>baz}}</div><div shimmy-in>{{foo}}{{bar}}{{baz}}</div>',
			data: { foo: 1 },
			partials: { foo: 'fooPartial' },
			transitions: { wiggle () { wiggled = true; } }
		});

		const SubSubclass = Subclass.extend({
			data: { bar: 2 },
			partials: { bar: 'barPartial' },
			transitions: { shimmy () { shimmied = true; } }
		});

		new SubSubclass({
			el: fixture,
			data: { baz: 3 },
			partials: { baz: 'bazPartial' }
		});

		t.htmlEqual( fixture.innerHTML, '<div>fooPartialbarPartialbazPartial</div><div>123</div>' );
		t.ok( wiggled );
		t.ok( shimmied );
	});

	// Commenting out - can't think of a way to test this in 0.8
	//test( 'Multiple identical evaluators merge', t => {
	// 	const ractive;
	//
	// 	ractive = new Ractive({
	// 		el: fixture,
	// 		template: '{{( a+b )}} {{( a+b )}} {{( a+b )}}',
	// 		data: { a: 1, b: 2 }
	// 	});
	//
	// 	t.htmlEqual( fixture.innerHTML, '3 3 3' );
	//
	// 	t.equal( ractive.viewmodel.root.propertyHash.a.dependants.methods.mark.length, 1 );
	// 	t.equal( ractive.viewmodel.root.propertyHash.b.dependants.methods.mark.length, 1 );
	// 	t.equal( ractive.viewmodel.root.properties.length, 3 );
	// });

	test( 'Boolean attributes work as expected', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input id="one" type="checkbox" checked="{{falsy}}"><input id="two" type="checkbox" checked="{{truthy}}">',
			data: { truthy: true, falsy: false }
		});

		t.equal( ractive.find( '#one' ).checked, false );
		t.equal( ractive.find( '#two' ).checked, true );
	});

	test( 'Instances can be created without an element', t => {
		const ractive = new Ractive({
			template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.ok( ractive );
	});

	test( 'Instances without an element can render HTML', t => {
		const ractive = new Ractive({
			template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.htmlEqual( ractive.toHTML(), '<ul><li>0: a</li><li>1: b</li><li>2: c</li></ul>' );
	});

	test( 'Triples work with toHTML', t => {
		const ractive = new Ractive({
			template: '{{{ triple }}}',
			data: { triple: '<p>test</p>' }
		});

		t.htmlEqual( ractive.toHTML(), '<p>test</p>' );
	});

	test( 'Passing in alternative delimiters', t => {
		new Ractive({
			el: fixture,
			template: '/~ greeting ~/, /~recipient~/! /~~ triple ~~/',
			data: {
				greeting: 'Hello',
				recipient: 'world',
				triple: '<p>here is some HTML</p>'
			},
			delimiters: [ '/~', '~/' ],
			tripleDelimiters: [ '/~~', '~~/' ]
		});

		t.htmlEqual( fixture.innerHTML, 'Hello, world! <p>here is some HTML</p>' );
	});

	test( 'Using alternative delimiters in template', t => {
		new Ractive({
			el: fixture,
			template: '{{=/~ ~/=}} {{{=/~~ ~~/=}}} /~ greeting ~/, /~recipient~/! /~~ triple ~~/',
			data: {
				greeting: 'Hello',
				recipient: 'world',
				triple: '<p>here is some HTML</p>'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'Hello, world! <p>here is some HTML</p>' );
	});

	test( '.unshift() works with proxy event handlers, without index references', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#items}}<button on-click="bla">Level1: {{ title }}</button>{{/items}}',
			data: {
				items: [{ title: 'Title1' }]
			}
		});

		ractive.unshift( 'items', { title: 'Title0' } );

		t.htmlEqual( fixture.innerHTML, '<button>Level1: Title0</button><button>Level1: Title1</button>' );
	});

	test( 'Updating values with properties corresponding to unresolved references works', t => {
		const user = {};

		const ractive = new Ractive({
			el: fixture,
			template: '{{#user}}{{name}}{{/user}}',
			data: { user }
		});

		t.equal( fixture.innerHTML, '' );
		user.name = 'Jim';
		ractive.update( 'user' );
		t.equal( fixture.innerHTML, 'Jim' );
	});

	test( 'Setting nested properties with a keypath correctly updates value of intermediate keypaths', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}{{#bar}}{{baz}}{{/bar}}{{/foo}}'
		});

		ractive.set( 'foo.bar.baz', 'success' );
		t.htmlEqual( fixture.innerHTML, 'success' );
	});

	test( 'Functions are called with the ractive instance as context', t => {
		t.expect( 1 );

		onWarn( () => {} ); // suppress

		const ractive = new Ractive({
			el: fixture,
			template: '{{ foo() }}'
		});

		ractive.set( 'foo', function () {
			t.equal( this, ractive );
		});
	});

	test( 'Methods are called with their object as context', t => {
		t.expect( 1 );

		onWarn( () => {} ); // suppress

		const ractive = new Ractive({
			el: fixture,
			template: '{{ foo.bar() }}'
		});

		const foo = {
			bar () {
				t.equal( this, foo );
			}
		};

		ractive.set( 'foo', foo );
	});

	test( 'Delimiters can be reset globally', t => {
		const oldDelimiters = Ractive.defaults.delimiters;
		const oldTripledDelimiters = Ractive.defaults.tripleDelimiters;

		Ractive.defaults.delimiters = [ '/~', '~/' ];
		Ractive.defaults.tripleDelimiters = [ '/~~', '~~/' ];

		new Ractive({
			el: fixture,
			template: '/~foo~/ /~~bar~~/',
			data: { foo: 'text', bar: '<strong>html</strong>' }
		});

		t.htmlEqual( fixture.innerHTML, 'text <strong>html</strong>' );

		Ractive.defaults.delimiters = oldDelimiters;
		Ractive.defaults.tripleDelimiters = oldTripledDelimiters;
	});

	test( 'Teardown works without throwing an error (#205)', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: 'a {{generic}} template',
			data: { generic: 'bog standard' }
		});

		try {
			ractive.teardown();
			t.ok( 1 );
		} catch ( err ) {
			t.ok( 0 );
		}
	});

	test( 'Bindings without explicit keypaths can survive a splice operation', t => {
		t.expect( 1 );

		const items = new Array( 3 );

		onWarn( () => {} ); // suppress

		const ractive = new Ractive({
			el: fixture,
			template: '<ul>{{#items}}<li><input value="{{foo}}"></li>{{/items}}</ul>',
			data: { items }
		});

		ractive.splice( 'items', 1, 1 );
		try {
			ractive.splice( 'items', 1, 1 );
			t.ok( 1 );
		} catch ( err ) {
			t.ok( 0 );
		}
	});

	test( 'Keypath resolutions that trigger teardowns don\'t cause the universe to implode', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{^foo}}not foo{{/foo}}{{#foo}}<widget items="{{items}}"/>{{/foo}}',
			data: { items: [ 1, 2 ] },
			components: {
				widget: Ractive.extend({ template: 'widget' })
			}
		});

		try {
			ractive.set( 'foo', true );
			t.ok( 1 );
		} catch ( err ) {
			t.ok( 0 );
		}
	});

	test( 'Inverted sections aren\'t broken by unshift operations', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{^items}}no items{{/items}}{{#items}}{{.}}{{/items}}',
			data: { items: [] }
		});

		t.htmlEqual( fixture.innerHTML, 'no items' );
		ractive.unshift( 'items', 'foo' );
		t.htmlEqual( fixture.innerHTML, 'foo' );
	});

	test( 'Splice operations that try to remove more items than there are from an array are handled', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#items}}{{.}}{{/items}}',
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.htmlEqual( fixture.innerHTML, 'abc' );
		ractive.splice( 'items', 2, 2 );
		t.htmlEqual( fixture.innerHTML, 'ab' );
	});

	test( 'Partial templates will be drawn from script tags if not already registered', t => {
		const partialScr = document.createElement( 'script' );
		partialScr.id = 'thePartial';
		partialScr.type = 'text/ractive';
		partialScr.textContent = '{{one}}{{two}}{{three}}';

		document.getElementsByTagName('body')[0].appendChild( partialScr );

		new Ractive({
			el: fixture,
			template: '{{>thePartial}}',
			data: { one: 1, two: 2, three: 3 }
		});

		t.htmlEqual( fixture.innerHTML, '123' );
	});

	test( 'ractive.insert() moves an instance to a different location', t => {
		const one = document.createElement( 'div' );
		const two = document.createElement( 'div' );

		const three = document.createElement( 'div' );
		three.innerHTML = '<p>before</p><p class="after">after</p>';

		const ractive = new Ractive({
			el: fixture,
			template: '<p>{{foo}}</p>',
			data: { foo: 'whee!' }
		});

		const p = ractive.find( 'p' );

		ractive.insert( one );
		t.ok( one.contains( p ) );

		ractive.insert( two );
		t.ok( !one.contains( p ) );
		t.ok( two.contains( p ) );

		ractive.insert( three, three.querySelector( '.after' ) );
		t.ok( three.contains( p ) );
		t.htmlEqual( three.innerHTML, '<p>before</p><p>whee!</p><p class="after">after</p>' );
	});

	test( 'ractive.insert() throws an error if instance is not rendered (#712)', t => {
		const one = document.createElement( 'div' );
		const two = document.createElement( 'div' );

		const three = document.createElement( 'div' );
		three.innerHTML = '<p>before</p><p class="after">after</p>';

		const ractive = new Ractive({
			template: '<p>{{foo}}</p>',
			data: { foo: 'whee!' }
		});

		try {
			ractive.insert( one );
			t.ok( false );
		} catch ( err ) {
			t.ok( true );
		}

		ractive.render( two );
		const p = ractive.find( 'p' );
		t.ok( !one.contains( p ) );
		t.ok( two.contains( p ) );

		ractive.insert( three, three.querySelector( '.after' ) );
		t.ok( three.contains( p ) );
		t.htmlEqual( three.innerHTML, '<p>before</p><p>whee!</p><p class="after">after</p>' );
	});

	test( 'Regression test for #271', t => {
		const items = [{}];
		const ractive = new Ractive({
			el: fixture,
			template: '{{#items}}<p>foo</p>{{# items.length > 1 }}<p>bar</p>{{/}}{{/items}}',
			data: { items }
		});

		t.htmlEqual( fixture.innerHTML, '<p>foo</p>' );

		ractive.push( 'items', {});
		t.htmlEqual( fixture.innerHTML, '<p>foo</p><p>bar</p><p>foo</p><p>bar</p>' );
		ractive.push( 'items', {});
		t.htmlEqual( fixture.innerHTML, '<p>foo</p><p>bar</p><p>foo</p><p>bar</p><p>foo</p><p>bar</p>' );

		ractive.splice( 'items', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '<p>foo</p><p>bar</p><p>foo</p><p>bar</p>' );
		ractive.splice( 'items', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '<p>foo</p>' );
	});

	test( 'Partials in shuffled sections are updated/removed correctly (#297)', t => {
		const items = [ 'one', 'two', 'three' ];

		const ractive = new Ractive({
			el: fixture,
			template: '{{#items}}{{>item}}{{/items}}',
			data: { items },
			partials: {
				item: '<p>{{.}}</p>'
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p>one</p><p>two</p><p>three</p>' );

		ractive.splice( 'items', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '<p>one</p><p>three</p>' );
	});

	test( 'Regression test for #316', t => {
		const a = [];
		const b = [];

		const ractive = new Ractive({
			el: fixture,
			template: '{{ a.length ? "foo" : b.length ? "bar" : "baz" }}',
			data: { a, b }
		});

		t.htmlEqual( fixture.innerHTML, 'baz' );

		ractive.push( 'b', 1 );
		t.htmlEqual( fixture.innerHTML, 'bar' );

		ractive.push( 'a', 1 );
		t.htmlEqual( fixture.innerHTML, 'foo' );
	});

	test( 'Regression test for #321', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: '<button on-click=\'@this.fire("test", event, ["just a string"])\'>test 1</button><button on-click=\'@this.fire("test", event, { bar: 3 })\'>test 2</button>'
		});

		ractive.on( 'test', ( event, arg ) => {
			t.deepEqual( arg, expected );
		});

		const buttons = ractive.findAll( 'button' );

		let expected = [ 'just a string' ];
		fire( buttons[0], 'click' );

		expected = { bar: 3 };
		fire( buttons[1], 'click' );
	});

	test( 'Evaluators that have a value of undefined behave correctly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{ list[index] }}',
			data: {
				index: 0,
				list: [ 'foo' ]
			}
		});

		t.htmlEqual( fixture.innerHTML, 'foo' );

		ractive.set( 'index', 1 );
		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( 'Regression test for #798', t => {
		function ClassB () {}
		function ClassA () {}
		ClassA.prototype.resources = new ClassB();

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget attr="{{item.resources}}"/>',
			data: { item: new ClassA() },
			components: {
				Widget: Ractive.extend({})
			}
		});

		t.ok( ractive.findComponent( 'Widget' ).get( 'attr' ) instanceof ClassB );
	});

	test( 'Subclass instance oncomplete() handlers can call _super', t => {
		t.expect( 1 );

		const done = t.async();

		const Subclass = Ractive.extend({
			oncomplete () {
				return 42;
			}
		});

		new Subclass({
			el: fixture,
			oncomplete () {
				t.equal( this._super(), 42 );
				done();
			}
		});
	});


	test( 'ractive.insert() with triples doesn\'t invoke Yoda (#391)', t => {
		const ractive = new Ractive({
			el: document.createElement( 'div' ),
			template: '{{{value}}}',
			data: {
				value: ' you are <i>very puzzled now</i>'
			}
		});

		ractive.insert( fixture );
		t.htmlEqual( fixture.innerHTML, ' you are <i>very puzzled now</i>' );
	});

	test( 'Regression test for #460', t => {
		const done = t.async();
		const items = [
			{ desc: 'foo' },
			{ desc: 'bar' },
			{ desc: 'baz' }
		];

		const ractive = new Ractive({
			el: fixture,
			template: '{{#items}}<p>{{desc}}:{{missing[data]}}</p>{{/items}}',
			data: { items }
		});

		ractive.pop( 'items' ).then( () => {
			ractive.push( 'items', { desc: 'baz' });
			t.htmlEqual( fixture.innerHTML, '<p>foo:</p><p>bar:</p><p>baz:</p>' );
			done();
		});

		t.htmlEqual( fixture.innerHTML, '<p>foo:</p><p>bar:</p>' );
	});

	test( 'Regression test for #457', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#step.current == step.current}}<p>{{foo}}</p>{{/step.current == step.current}}'
		});

		ractive.set({
			foo: 'bar',
			step: {
				current: 2
			}
		});

		t.ok( true );
	});

	if ( Ractive.svg ) {
		test( 'Case-sensitive conditional SVG attribute', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<svg {{vb}}></svg>',
				data: { vb: 'viewBox="0 0 100 100"' }
			});

			t.equal( ractive.find( 'svg' ).getAttribute( 'viewBox' ), '0 0 100 100' );
		});
	}

	test( 'Custom delimiters apply to partials (#601)', t => {
		new Ractive({
			el: fixture,
			template: '([#items:i])([>foo])([/items])',
			partials: { foo: '([a])' },
			data: { items: [{a:0},{a:1}] },
			delimiters: [ '([', '])' ],
			tripleDelimiters: [ '([[', ']])' ]
		});

		t.htmlEqual( fixture.innerHTML, '01' );
	});

	test( 'Rendering to an element, if `append` is false, causes any existing instances to be torn down', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: 'foo'
		});

		ractive.on( 'teardown', () => {
			t.ok( true );
		});

		new Ractive({
			el: fixture,
			template: 'bar'
		});

		t.htmlEqual( fixture.innerHTML, 'bar' );
	});

	// This test fails since #816, because evaluators are treated as computed properties.
	// Kept here in case we come up with a smart way to have the best of both worlds
	/*test( 'Evaluators are not called if their expressions no longer exist (#716)', t => {
		const ractive, doubled = 0, tripled = 0;

		ractive = new Ractive({
			el: fixture,
			template: '<p>{{double(foo)}}</p>{{#bar}}<p>{{triple(foo)}}</p>{{/bar}}',
			data: {
				foo: 3,
				double: function ( foo ) {
					doubled += 1;
					return foo * 2;
				},
				triple: function ( foo ) {
					tripled += 1;
					return foo * 3;
				}
			}
		});

		t.equal( doubled, 1 );
		t.equal( tripled, 0 );

		ractive.set({
			foo: 4,
			bar: true
		});

		t.equal( doubled, 2 );
		t.equal( tripled, 1 );

		ractive.set({
			foo: 5,
			bar: false
		});
		t.equal( doubled, 3 );
		t.equal( tripled, 1 );
	});*/

	test( 'Regression test for #695 (unrendering non-rendered items)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{# { items: nested.items } }}{{#insert}}{{#items}}<div as-foo></div>{{/items}}{{/insert}}{{/}}',
			decorators: {
				foo () {
					return { teardown () {} };
				}
			}
		});

		ractive.set({
			nested: {
				items: [0,1,2]
			},
			insert: false
		});

		ractive.set({
			nested: {
				items: [0,1]
			},
			insert: true
		});

		t.ok( true );
	});

	test( 'A Promise will be rejected if its callback throws (#759)', t => {
		const done = t.async();

		const p = new Promise( () => {
			throw 'ruh-roh';
		});

		p.then( null, ( err ) => {
			t.equal( err, 'ruh-roh' );
			done();
		});
	});

	test( 'A Promise will be chained and rejected if its callback throws ', t => {
		const done = t.async();

		const p = Promise.resolve();

		p.then( () => {
			throw 'ruh-roh';
		}).then( null, err => {
			t.equal( err, 'ruh-roh' );
			done();
		});
	});

	test( 'Keypaths in ractive.set() can contain wildcards (#784)', t => {
		const ractive = new Ractive({
			data: {
				array: [
					{ active: true },
					{ active: false },
					{ active: true }
				],
				object: { foo: 1, bar: 2, baz: 3 }
			}
		});

		ractive.set( 'array.*.active', false );
		t.deepEqual( ractive.get( 'array' ), [{ active: false }, { active: false }, { active: false }]);

		ractive.set( 'object.*', 42 );
		t.deepEqual( ractive.get( 'object' ), { foo: 42, bar: 42, baz: 42 });
	});

	test( 'Wildcard keypaths do not affect array length', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{array.length}}',
			data: {
				array: [ 1, 2, 3 ]
			}
		});

		ractive.set( 'array.*', 10 );
		t.deepEqual( ractive.get( 'array.length' ), 3 );
	});

	test( 'Regression test for #801', t => {
		const ractive = new Ractive({
			el: document.createElement( 'div' ),
			template: '<div>{{#(foo !== "bar")}}not bar{{#(foo !== "baz")}}not baz{{/()}}{{/()}}</div>',
			data: {
				foo: 'baz'
			}
		});

		ractive.set( 'foo', 'bar' );
		t.ok( true );
	});

	test( 'Regression test for #832', t => {
		const ractive = new Ractive({
			el: document.createElement( 'div' ),
			template: '{{#if obj[foo].length}}{{#each obj[foo]}}{{this}}{{/each}}{{/if}}',
			data: {
				obj: {
					a: ['x']
				},
				foo: 'a'
			}
		});

		ractive.set( 'foo', 'b' );
		t.ok( true );
	});

	test( 'Regression test for #857', t => {
		const ractive = new Ractive({
			el: document.createElement( 'div' ),
			template: '<textarea value="{{foo}}"></textarea>',
			data: {
				foo: 'works'
			}
		});

		t.equal( ractive.find( 'textarea' ).value, 'works' );
	});

	test( 'oncomplete handlers are called for lazily-rendered instances (#749)', t => {
		t.expect( 1 );

		const done = t.async();

		const ractive = new Ractive({
			template: '<p>foo</p>',
			oncomplete () {
				t.ok( true );
				ractive.teardown();
				done();
			}
		});

		ractive.render( fixture );
	});

	test( 'Doctype declarations are handled, and the tag name is uppercased (#877)', t => {
		const ractive = new Ractive({
			template: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>{{title}}</title></head><body>{{hello}} World!</body></html>',
			data: { title: 'hi', hello: 'Hello' }
		});

		t.equal( ractive.toHTML(), '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>hi</title></head><body>Hello World!</body></html>' );
	});

	test( 'Resolvers are torn down (#884)', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#if foo}}
					{{# steps[currentStep] }}
						argh
					{{/}}

					<!-- comment -->
				{{/if}}`,
			data: {
				currentStep: 0,
				steps: [{}, {}]
			}
		});

		ractive.set( 'foo', true );
		ractive.set( 'foo', false );
		ractive.set( 'currentStep', 1 );
	});

	test( 'Regression test for #844', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{# steps[currentStep] }}
					{{#if bool}}
						some text
						<!-- this is needed! -->
					{{/if}}
				{{/}}
				{{#if currentStep < steps.length - 1 }}
					<a on-click='toggleStep'>toggle step: 1</a>
				{{else}}
					<a on-click='toggleStep'>toggle step: 0</a>
				{{/if}}`,
			data: {
				currentStep: 0,
				stepsQuantity: 2,
				steps: [{ x: true }, { x: true }],
				bool: true
			}
		});

		ractive.set( 'currentStep', null );
		ractive.set( 'currentStep', 1 );

		t.htmlEqual( fixture.innerHTML, 'some text  <a>toggle step: 0</a>' );

		ractive.set( 'currentStep', 0 );
		t.htmlEqual( fixture.innerHTML, 'some text  <a>toggle step: 1</a>' );
	});

	test( 'Mustaches that re-resolve to undefined behave correctly (#908)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{# steps[currentStep] }}
					<p>{{currentStep}}: {{name}}</p>
				{{/}}`,
			data: {
				currentStep: 0,
				steps: [
					{
						name: 'zero'
					},
					{
						name: 'one'
					}
				]
			}
		});

		ractive.set( 'currentStep', null );
		ractive.set( 'currentStep', 1 );

		t.htmlEqual( fixture.innerHTML, '<p>1: one</p>' );
	});

	test( 'Content renders to correct place when subsequent sections have no nodes (#910)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{ >partial}} <!-- foo -->',
			partials: {
				partial: `
					{{# steps[currentStep] }}
						before
					{{/}}
					{{#if currentStep !== 1 }}
						after
					{{else}}
						after
					{{/if}}`
			},
			data: {
				currentStep: 0,
				steps: [ true, true ]
			}
		});

		ractive.set( 'currentStep', null );
		ractive.set( 'currentStep', 1 );

		t.htmlEqual( fixture.innerHTML, 'before after' );
	});

	test( 'Dependants can register more than once without error (#838)', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#if foo}}<p>{{fn(foo)}}</p>{{/if}}',
			data: {
				fn ( foo ) {
					foo.bar;
					this.get( 'foo' );
					this.get( 'bar' );
				}
			}
		});

		ractive.set( 'foo', {} );
		ractive.set( 'foo', null );
	});

	test( 'Ractive.extend() with parsed template (#939)', t => {
		const parsed = Ractive.parse( '<p>{{foo}}</p>' );
		const Widget = Ractive.extend({ template: parsed });

		const ractive = new Widget({ data: { foo: 'bar' }});
		t.equal( ractive.toHTML(), '<p>bar</p>' );
	});

	test( 'Regression test for #950', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#if editing}}
					<select value="{{selected}}" on-select="done-selecting" on-blur="done-selecting">
						<option disabled>Select:</option>
						{{#each items}}
						<option>{{this}}</option>
						{{/each}}
					</select>
				{{else}}
					<input type="checkbox" checked="{{editing}}"/>
					<span class="hover-text">{{#if selected}}{{selected}}{{else}}Select...{{/if}}</span>
				{{/if}}`,
			data: {
				editing: true,
				items: [ 'Apples', 'Oranges', 'Samsungs' ]
			}
		});

		ractive.observe('selected', () => {
			ractive.set('editing', false);
		}, { init: false });

		ractive.on( 'done-selecting', () => {
			ractive.set( 'editing', false );
		});

		const select = ractive.find( 'select' );
		select.focus();
		select.options[2].selected = true;
		fire( select, 'change' );
	});

	test( 'Custom delimiters apply to inline partials (#990)', t => {
		const ractive = new Ractive({
			template: '([#partial a])abc([/partial])',
			delimiters: [ '([', '])' ]
		});

		t.deepEqual( ractive.partials, { a : [ 'abc' ] });
	});

	test( 'Regression test for #1019', t => {
		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template: '<img src="/qunit/350x150.gif" width="{{350}}">'
		});

		const img = ractive.find( 'img' );

		let i = 0;
		const int = setInterval( () => {
			if ( img.complete || i++ === 20 ) {
				clearInterval( int );
				t.equal( img.width, 350 );
				done();
			}
		}, 100);
	});

	test( 'Another regression test for #1019', t => {
		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template: '<div style="width: 350px"><img src="/qunit/350x150.gif" width="100%"></div>'
		});

		const img = ractive.find( 'img' );

		let i = 0;
		const int = setInterval( () => {
			if ( img.complete || i++ === 20 ) {
				clearInterval( int );
				t.equal( img.width, 350 );
				done();
			}
		}, 100);
	});

	test( 'Regression test for #1003', t => {
		new Ractive({
			el: fixture,
			template: `
				{{#unless foo}}y{{/unless}}

				<select value="{{foo}}">
					<option>x</option>
				</select>`
		});

		t.htmlEqual( fixture.innerHTML, '<select><option>x</option></select>' );
	});

	test( 'Regression test for #1055', t => {
		const _ = {
			bind () {
				// do nothing
			},
			uppercase ( str ) {
				return str.toUpperCase();
			}
		};

		new Ractive({
			el: fixture,
			template: '{{_.uppercase(str)}}',
			data: {
				_,
				str: 'foo'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'FOO' );
	});

	test( 'Regression test for #2915', t => {
		// This is how Underscore defines `_`:
		// https://github.com/jashkenas/underscore/blob/8fc7032295d60aff3620ef85d4aa6549a55688a0/underscore.js#L42
		// It is important to the purposes of this test, as distinct from the one
		// above, that `_` be a function that uses `this`.
		const _ = function (obj) {
			if (obj instanceof _) return obj;
			if (!(this instanceof _)) return new _(obj);
			this._wrapped = obj;
		};

		_.bind = function () {
			// do nothing
		};

		_.uppercase = function ( str ) {
			return str.toUpperCase();
		};

		new Ractive({
			el: fixture,
			template: '{{_.uppercase(str)}}',
			data: {
				_,
				str: 'foo'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'FOO' );
	});

	test( 'Interpolation of script/style contents can be disabled (#1050)', t => {
		new Ractive({
			el: fixture,
			template: '<script>window.TEST_VALUE = "{{uninterpolated}}";</script>',
			data: { uninterpolated: 'whoops' },
			interpolate: { script: false }
		});

		t.equal( window.TEST_VALUE, '{{uninterpolated}}' );

		try {
			delete window.TEST_VALUE;
		} catch ( err ) {
			window.TEST_VALUE = null; // IE8, sigh
		}
	});

	test( 'Changing the length of a section has no effect to detached ractives until they are reattached (#1053)', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '{{#if foo}}yes{{else}}no{{/if}}',
			data: {
				foo: true
			}
		});

		ractive.detach();
		ractive.set( 'foo', false );
		t.htmlEqual( fixture.innerHTML, '' );

		ractive.insert( fixture );
		t.htmlEqual( fixture.innerHTML, 'no' );

		ractive = new Ractive({
			el: fixture,
			template: '{{#each letters}}{{this}}{{/each}}',
			data: {
				letters: [ 'a', 'b', 'c' ]
			}
		});

		ractive.detach();
		ractive.push( 'letters', 'd', 'e', 'f' );
		t.htmlEqual( fixture.innerHTML, '' );

		ractive.insert( fixture );
		t.htmlEqual( fixture.innerHTML, 'abcdef' );
	});

	test( 'Regression test for #1038', t => {
		t.expect( 0 );

		const done = t.async();

		const ractive = new Ractive({
			el: document.createElement( 'div' ),
			template: `
				{{#with obj}}
					{{#if loading}}
						Loading...
					{{else}}
						{{#error}}
							Error!
						{{/error}}

						Content.
					{{/if}}
				{{/with}}`,
			data: {
				obj: {}
			}
		});

		ractive.set( 'obj.loading', true );

		setTimeout( () => {
			ractive.set( 'obj.error', true );
			ractive.set( 'obj.loading', false );

			done();
		});
	});

	test( 'Reference expressions can become invalid after being valid, without breaking (#1106)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#with items[i]}}
					{{this}}
				{{/with}}`,
			data: {
				items: [ 'a', 'b', 'c', 'd' ]
			}
		});

		ractive.set( 'i', 0 );
		t.htmlEqual( fixture.innerHTML, 'a' );

		ractive.set( 'i', 1 );
		t.htmlEqual( fixture.innerHTML, 'b' );

		ractive.set( 'i', null );
		t.htmlEqual( fixture.innerHTML, '' );
		ractive.set( 'i', 2 );

		t.htmlEqual( fixture.innerHTML, 'c' );
	});

	test( 'Implicitly-closed elements without closing section tag (#1124)', t => {
		// this test lives here, not in render.js, due to an awkward quirk with htmlEqual -
		// it corrects malformed HTML before stubbing it
		let ractive = new Ractive({
			el: fixture,
			template: '<ul><li>one<li>two<li>three</li></ul>'
		});

		t.equal( ractive.findAll( 'ul > li' ).length, 3 );

		ractive = new Ractive({
			el: fixture,
			template: '<table><tr><td>one<td>two<td>three</td></tr></table>'
		});

		t.equal( ractive.findAll( 'tr > td' ).length, 3 );
	});

	test( 'Reference expressions used in component parameters teardown properly (#1130)', t => {

		const ractive = new Ractive({
			el: fixture,
			template: '<widget data="{{foo[bar]}}"/>',
			components: {
				widget: Ractive.extend({})
			},
			data: {
				foo: { a: 'apple', b: 'banana' },
				bar: 'a'
			}
		});

		ractive.teardown();

		t.ok( true );
	});

	test( 'Regression test for #1166 (spellcheck bug)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input class="one" spellcheck="false"><input class="two" spellchecker="false">',
			data: { name: 'world' }
		});

		const one = ractive.find( '.one' );
		const two = ractive.find( '.two' );

		t.ok( !one.spellcheck );
		t.equal( one.getAttribute( 'spellcheck' ), 'false' );
		t.equal( two.getAttribute( 'spellchecker' ), 'false' );
	});

	test( '. reference without any implicit or explicit context should resolve to root', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{JSON.stringify(.)}}',
			data: { foo: 'bar' }
		});

		t.equal( fixture.innerHTML, JSON.stringify( ractive.viewmodel.value ) );
		ractive.set( 'foo', 'test' );
		t.equal( fixture.innerHTML, JSON.stringify( ractive.viewmodel.value ) );
	});

	test( 'Nested conditional computations should survive unrendering and rerendering (#1364)', ( t ) => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#cond}}{{# i === 1 }}1{{/}}{{# i === 2 }}2{{/}}{{/}}',
			data: { i: 1, cond: true }
		});

		t.equal( fixture.innerHTML, '1' );
		ractive.set( 'cond', false );
		ractive.set( 'cond', true );
		ractive.set( 'i', 2 );
		t.equal( fixture.innerHTML, '2' );
	});

	test( 'DOCTYPE declarations are stringified correctly', t => {
		const template = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html></html>';
		t.equal( new Ractive({ template }).toHTML(), template );
	});

	test( 'Ractive.getContext returns correct keypath, index, and ractive info', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div><foo /></div>{{#bars:i}}<b>b</b><foo />{{/}}{{#baz}}{{#bat}}<p>hello</p>{{/}}{{/}}',
			components: {
				foo: Ractive.extend({
					template: '<span>foo</span>',
					isolated: false
				})
			},
			data: {
				bars: [1, 2],
				baz: { bat: { x: true } }
			}
		});

		const div = Ractive.getContext( ractive.find( 'div' ) );
		const p = Ractive.getContext( ractive.find( 'p' ) );
		const [b1, b2] = ractive.findAll( 'b' ).map( n => Ractive.getContext( n ) );
		const [span1, span2, span3] = ractive.findAll( 'span' ).map( n => Ractive.getContext( n ) );
		const [foo1, foo2, foo3] = ractive.findAllComponents( 'foo' );

		t.equal( div.ractive, ractive );
		t.equal( span1.ractive, foo1 );
		t.equal( span2.ractive, foo2 );
		t.equal( span3.ractive, foo3 );

		t.equal( span1.resolve(), '' );
		t.equal( span2.resolve(), '' );
		t.equal( span3.resolve(), '' );
		t.equal( b1.resolve(), 'bars.0' );
		t.equal( b2.resolve(), 'bars.1' );

		t.equal( span1.get( 'i' ), undefined );
		t.equal( span2.get( 'i' ), 0 );
		t.equal( span3.get( 'i' ), 1 );
		t.equal( b1.get( 'i' ), 0 );
		t.equal( b2.get( 'i' ), 1 );

		t.equal( p.resolve(), 'baz.bat' );
	});

	test( 'Boolean attributes are added/removed based on unstringified fragment value', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<button disabled="{{foo}}"></button>',
			data: {
				foo: true
			}
		});

		const button = ractive.find( 'button' );
		t.ok( button.disabled );

		ractive.set( 'foo', false );
		t.ok( !button.disabled );
	});

	test( 'input[type=range] values are respected regardless of attribute order (#1621)', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '<input type="range" min="0" max="200" value="150"/>'
		});

		t.equal( ractive.find( 'input' ).value, 150 );

		ractive = new Ractive({
			el: fixture,
			template: '<input value="150" type="range" min="0" max="200"/>'
		});

		t.equal( ractive.find( 'input' ).value, 150 );
	});

	test( 'regression test for #1630', t => {
		const ractive = new Ractive();

		const obj = { foo: 'bar' };
		obj.constructor = obj.constructor;

		ractive.set( obj );
		t.equal( ractive.get( 'foo' ), 'bar' );
		t.equal( ractive.get( 'constructor' ), obj.constructor );
	});

	test( 'Ractive can be instantiated without `new`', t => {
		t.ok( Ractive() instanceof Ractive );

		const Subclass = Ractive.extend();
		t.ok( Subclass() instanceof Subclass );
		t.ok( Subclass() instanceof Ractive );
	});

	test( 'multiple pattern keypaths can be set simultaneously (#1319)', t => {
		const ractive = new Ractive({
			data: {
				foo: [ 1, 2, 3 ],
				bar: [ 4, 5, 6 ]
			}
		});

		ractive.set({
			'foo.*': 5,
			'bar.*': 10
		});

		t.deepEqual( ractive.get( 'foo' ), [ 5, 5, 5 ] );
		t.deepEqual( ractive.get( 'bar' ), [ 10, 10, 10 ] );
	});

	test( 'Promise.all works with non-promises (#1642)', t => {
		const done = t.async();

		// this test is redundant in browsers that support Promise natively
		Promise.all([ Promise.resolve( 1 ), 2 ]).then( values => {
			t.deepEqual( values, [ 1, 2 ]);
			done();
		});
	});

	test( 'Setting an escaped . keypath', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{ foo\\.bar\\.baz }}`,
			data: {}
		});

		t.htmlEqual( fixture.innerHTML, '' );
		r.set( 'foo\\.bar\\.baz', 'yep' );
		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( 'Getting an escaped . keypath', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{ .['foo.bar.baz'] }}`,
			data: { 'foo.bar.baz': 'yep' }
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
		t.equal( r.get( 'foo\\.bar\\.baz' ), 'yep' );
	});

	test( '$ can be used in keypaths', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{ $$ }}{{ .['..'] }}`,
			data: { $$: 'get() works' }
		});

		t.htmlEqual( fixture.innerHTML, 'get() works' );
		t.equal( r.get( '$$' ), 'get() works' );

		r.set( '$$', 'set() works as well' );

		t.htmlEqual( fixture.innerHTML, 'set() works as well' );
		t.equal( r.get( '$$' ), 'set() works as well' );
	});

	test( '. escapes can be escaped', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{ .['foo\\\\'].bar }}{{ .['foo\\\\.bar'] }}`,
			data: { 'foo\\': { bar: 1 }, 'foo\\.bar': 2 }
		});

		t.htmlEqual( fixture.innerHTML, '12' );
		t.equal( r.get( 'foo\\\\.bar' ), 1 );
		t.equal( r.get( 'foo\\\\\\.bar' ), 2 );

		r.set( 'foo\\\\.bar', 11 );
		r.set( 'foo\\\\\\.bar', 12 );

		t.htmlEqual( fixture.innerHTML, '1112' );
		t.equal( r.get( 'foo\\\\.bar' ), 11 );
		t.equal( r.get( 'foo\\\\\\.bar' ), 12 );
	});

	if ( hasUsableConsole ) {
		test( 'Ractive.DEBUG can be changed', t => {
			t.expect( 0 );

			const DEBUG = Ractive.DEBUG;
			Ractive.DEBUG = false;

			onWarn( () => t.ok( false ) );

			new Ractive({ template: '{{>thisWouldNormallyWarn}}' });

			Ractive.DEBUG = DEBUG;
		});
	}

	test( '@this special ref gives access to the ractive instance', t => {
		const DEBUG = Ractive.DEBUG;
		const r = new Ractive({
			el: fixture,
			template: `{{@this.constructor.VERSION}} {{@this.foo}} <input type="checkbox" checked="{{@this.constructor.DEBUG}}" />`
		});

		t.htmlEqual( fixture.innerHTML, `${Ractive.VERSION}  <input type="checkbox" />` );

		r.foo = 'bar';
		r.update('@this.foo');

		t.htmlEqual( fixture.innerHTML, `${Ractive.VERSION} bar <input type="checkbox" />` );

		fire( r.find( 'input' ), 'click' );
		t.equal( Ractive.DEBUG, !DEBUG );

		fire( r.find( 'input' ), 'click' );
		t.equal( Ractive.DEBUG, DEBUG );

		r.set( '@this.foo', 'baz' );
		t.htmlEqual( fixture.innerHTML, `${Ractive.VERSION} baz <input type="checkbox" />` );

		r.foo = 'bat';
		t.htmlEqual( fixture.innerHTML, `${Ractive.VERSION} baz <input type="checkbox" />` );
		r.update( '@this.foo' );
		t.htmlEqual( fixture.innerHTML, `${Ractive.VERSION} bat <input type="checkbox" />` );

		Ractive.DEBUG = DEBUG;
	});

	test( 'shuffled elements have the correct keypath in their node info', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}<span>{{.}}</span>{{/each}}',
			data: { list: [ 42, 42, 42 ] }
		});

		t.equal( Ractive.getContext( r.findAll( 'span' )[2] ).resolve(), 'list.2' );
		r.unshift( 'list', 42 );
		t.equal( Ractive.getContext( r.findAll( 'span' )[2] ).resolve(), 'list.2' );
	});

	test( 'ractive.escapeKey() works correctly', t => {
		t.equal( Ractive.escapeKey( 'foo.bar' ), 'foo\\.bar' );
		t.equal( Ractive.escapeKey( 'foo\\.bar' ), 'foo\\\\\\.bar' );
	});

	test( 'spread args can be applied to any invocation expression', t => {
		t.expect( 4 );

		const r = new Ractive({
			el: fixture,
			template: `{{.count(...list).and(...foo, ...bar)}}`,
			data: {
				list: [], foo: [ 1, 2 ], bar: [ 4, 5, 6 ],
				count() {
					const r = this;
					t.equal( arguments.length, this.get( 'list.length' ) );
					return {
						and () {
							t.equal( arguments.length, r.get( 'foo.length' ) + r.get( 'bar.length' ) );
						}
					};
				}
			}
		});

		r.push( 'list', 'a', 'b', 'c' );
	});

	test( 'ractive.unescapeKey() works correctly', t => {
		t.equal( Ractive.unescapeKey( 'foo\\.bar' ), 'foo.bar' );
		t.equal( Ractive.unescapeKey( 'foo\\\\\\.bar' ), 'foo\\.bar' );
	});

	test( 'ractive.joinKeys() works correctly', t => {
		t.equal( Ractive.joinKeys( 'foo', 'bar.baz' ), 'foo.bar\\.baz' );
		t.equal( Ractive.joinKeys( 'foo', 'bar\\.baz' ), 'foo.bar\\\\\\.baz' );
	});

	test( 'ractive.splitKeypath() works correctly', t => {
		t.deepEqual( Ractive.splitKeypath( 'foo.bar\\.baz' ), [ 'foo', 'bar.baz' ] );
		t.deepEqual( Ractive.splitKeypath( 'foo.bar\\\\\\.baz' ), [ 'foo', 'bar\\.baz' ] );
	});

	test( 'triple curly binding', t => {
		t.expect( 11 );

		onWarn( message => {
			t.ok( ~message.indexOf( 'It is not possible create a binding using a triple mustache.' ), 'Binding a triple curly should warn.' );
		});

		new Ractive({
			el: fixture,
			template: `
				<input type="text" value="{{{foo}}}">
				<input type="number" value="{{{foo}}}">
				<input type="file" value="{{{foo}}}">
				<input type="checkbox" name="{{{foo}}}">
				<input type="checkbox" checked="{{{foo}}}">
				<input type="radio" name="{{{foo}}}">
				<input type="radio" checked="{{{foo}}}">
				<textarea value="{{{foo}}}"></textarea>
				<select value="{{{foo}}}">
					<option value="bar">bar</option>
				</select>
				<select value="{{{foo}}}" multiple>
					<option value="bar">bar</option>
				</select>
				<div contenteditable="true" value="{{{foo}}}"></div>
			`,
			data: { foo: 'bar' }
		});
	});

	// Is there a way to artificially create a FileList? Leaving this commented
	// out until someone smarter than me figures out how
	//test( '{{#each}} iterates over a FileList (#1220)', t => {
	// 	var input, files, ractive;

	// 	input = document.createElement( 'input' );
	// 	input.type = 'file';
	// 	files = input.files;

	// 	files[0] = { name: 'one.txt' };
	// 	files[1] = { name: 'two.txt' };
	// 	files[2] = { name: 'three.txt' };

	// 	ractive = new Ractive({
	// 		el: fixture,
	// 		template: '{{#each files}}<p>{{name}}</p>{{/each}}',
	// 		data: { files: files }
	// 	});

	// 	t.htmlEqual( fixture.innerHTML, '<p>one.txt</p><p>two.txt</p><p>three.txt</p>' );
	// });

	if ( !/phantom/i.test( navigator.userAgent ) ) {
		test( '<input value="{{foo}}"> where foo === null should not render a value (#390)', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}">',
				data: {
					foo: null
				}
			});

			t.equal( ractive.find( 'input' ).value, '' );
		});

		test( 'ractive.detach() removes an instance from the DOM and returns a document fragment', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p>',
				data: { foo: 'whee!' }
			});

			const p = ractive.find( 'p' );

			const docFrag = ractive.detach();
			t.ok( docFrag instanceof DocumentFragment );
			t.ok( docFrag.contains( p ) );
		});

		test( 'ractive.detach() works with a previously unrendered ractive', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p>',
				data: { foo: 'whee!' }
			});

			const p = ractive.find( 'p' );

			const docFrag = ractive.detach();
			t.ok( docFrag instanceof DocumentFragment );
			t.ok( docFrag.contains( p ) );
		});

		test( 'Components with two-way bindings set parent values on initialisation', t => {
			const Dropdown = Ractive.extend({
				template: '<select value="{{value}}">{{#options}}<option value="{{this}}">{{ this[ display ] }}</option>{{/options}}</select>'
			});

			const ractive = new Ractive({
				el: fixture,
				template: '<h2>Select an option:</h2><dropdown options="{{numbers}}" value="{{number}}" display="word"/><p>Selected: {{number.digit}}</p>',
				data: {
					numbers: [
						{ word: 'one', digit: 1 },
						{ word: 'two', digit: 2 },
						{ word: 'three', digit: 3 },
						{ word: 'four', digit: 4 }
					]
				},
				components: {
					dropdown: Dropdown
				}
			});

			t.deepEqual( ractive.get( 'number' ), { word: 'one', digit: 1 });
		});

		test( 'Tearing down expression mustaches and recreating them does\'t throw errors', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '{{#condition}}{{( a+b )}} {{( a+b )}} {{( a+b )}}{{/condition}}',
				data: { a: 1, b: 2, condition: true }
			});

			t.equal( fixture.innerHTML, '3 3 3' );

			ractive.set( 'condition', false );
			t.equal( fixture.innerHTML, '' );

			ractive.set( 'condition', true );
			t.equal( fixture.innerHTML, '3 3 3' );
		});

		test( 'Updating an expression section doesn\'t throw errors', t => {
			const array = [{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }, { foo: 5 }];

			const ractive = new Ractive({
				el: fixture,
				template: '{{#( array.slice( 0, 3 ) )}}{{foo}}{{/()}}',
				data: { array }
			});

			t.equal( fixture.innerHTML, '123' );

			ractive.push( 'array', { foo: 6 } );
			t.equal( fixture.innerHTML, '123' );

			ractive.unshift( 'array', { foo: 0 } );
			t.equal( fixture.innerHTML, '012' );

			ractive.set( 'array', [] );
			t.equal( array._ractive, undefined );
			t.equal( fixture.innerHTML, '' );

			ractive.set( 'array', array );
			t.equal( fixture.innerHTML, '012' );
		});

		test( 'noConflict reinstates original Ractive value (#2066)', t => {
			const r = Ractive;
			const noConflict = r.noConflict();

			t.equal( Ractive, undefined );
			t.equal( r, noConflict );

			Ractive = r;
		});

		test( 'Updating a list section with child list expressions doesn\'t throw errors', t => {
			const array = [
				{ foo: [ 1, 2, 3, 4, 5 ] },
				{ foo: [ 2, 3, 4, 5, 6 ] },
				{ foo: [ 3, 4, 5, 6, 7 ] },
				{ foo: [ 4, 5, 6, 7, 8 ] },
				{ foo: [ 5, 6, 7, 8, 9 ] }
			];

			const ractive = new Ractive({
				el: fixture,
				template: '{{#array}}<p>{{#( foo.slice( 0, 3 ) )}}{{.}}{{/()}}</p>{{/array}}',
				data: { array }
			});

			t.htmlEqual( fixture.innerHTML, '<p>123</p><p>234</p><p>345</p><p>456</p><p>567</p>' );

			ractive.push( 'array', { foo: [ 6, 7, 8, 9, 10 ] } );
			t.htmlEqual( fixture.innerHTML, '<p>123</p><p>234</p><p>345</p><p>456</p><p>567</p><p>678</p>' );

			ractive.unshift( 'array', { foo: [ 0, 1, 2, 3, 4 ] } );
			t.htmlEqual( fixture.innerHTML, '<p>012</p><p>123</p><p>234</p><p>345</p><p>456</p><p>567</p><p>678</p>' );

			ractive.set( 'array', [] );
			t.equal( array._ractive, undefined );
			t.htmlEqual( fixture.innerHTML, '' );

			ractive.set( 'array', array );
			t.htmlEqual( fixture.innerHTML, '<p>012</p><p>123</p><p>234</p><p>345</p><p>456</p><p>567</p><p>678</p>' );
		});

		test( `trying to set a property on a non-object doesn't break the world (#2451)`, t => {
			t.expect( 1 );

			onWarn( w => {
				t.ok( /non-object/.test( w ) );
			});

			const r = new Ractive();
			r.set( 'foo', 'string' );
			r.set( 'foo.bar', 'nerp' );
		});
	}

	test( `you can request more lines of context for parser errors`, t => {
		try {
			Ractive.parse( 'hello\n{{foo}\nworld', { contextLines: 1 } );
		} catch (e) {
			t.ok( ~e.message.indexOf( 'hello\n{{foo}\n     ^----\nworld' ) );
		}
	});

	test( `setting a null value to null does nothing`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#if !foo}}yep{{/if}}`,
			data: { foo: null }
		});

		r.observe( 'foo', () => t.ok( false, 'should not fire' ), { init: false } );
		r.set( 'foo', null );

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( `non-bmp characters in templates`, t => {
		new Ractive({
			target: fixture,
			template: '{{foo}}',
			data: { foo: '😀𠀀' }
		});

		t.equal( fixture.innerHTML, '😀𠀀'  );
	});

	test( `entities in triples survive toHTML (#2882)`, t => {
		const r = new Ractive({
			template: '{{{html}}}',
			data: {
				html: '<b>&amp; &lt;</b>'
			}
		});

		t.equal( r.toHTML(), '<b>&amp; &lt;</b>' );
	});

	test( `el is aliased as target on the instance mirroring the init param`, t => {
		const r = new Ractive({
			el: fixture
		});

		t.ok( r.el === fixture && r.target === fixture );
	});

	test( `exclude data from resolveInstanceMembers`, t => {
		new Ractive({
			target: 'fixture',
			template: `{{JSON.stringify(data)}}`
		});

		t.equal( fixture.innerHTML, '' );
	});
}
