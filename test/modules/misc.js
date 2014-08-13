define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Foo, fooAdaptor;

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		Foo = function ( content ) {
			this.content = content;
		};

		fooAdaptor = {
			filter: function ( object ) {
				return object instanceof Foo;
			},
			wrap: function ( ractive, foo, keypath, prefix ) {
				return {
					get: function () {
						return foo.content;
					},
					teardown: function () {

					}
				};
			}
		};

		module( 'Miscellaneous', {
			setup: function(){
				Ractive.adaptors.foo = fooAdaptor;
			},
			teardown: function(){
				delete Ractive.adaptors.foo;
			}
		} );

		test( 'Subclass instance data extends prototype data', function ( t ) {
			var Subclass, instance;

			Subclass = Ractive.extend({
				template: '{{foo}} {{bar}}',
				data: { foo: 1 }
			});

			instance = new Subclass({
				el: fixture,
				data: { bar: 2 }
			});

			t.htmlEqual( fixture.innerHTML, '1 2' );
			t.deepEqual( instance.get(), { foo: 1, bar: 2 });
		});

		test( 'Subclasses of subclasses inherit data, partials and transitions', function ( t ) {
			var Subclass, SubSubclass, wiggled, shimmied, instance;

			Subclass = Ractive.extend({
				template: '<div intro="wiggle">{{>foo}}{{>bar}}{{>baz}}</div><div intro="shimmy">{{foo}}{{bar}}{{baz}}</div>',
				data: { foo: 1 },
				partials: { foo: 'fooPartial' },
				transitions: { wiggle: function ( t ) { wiggled = true; } }
			});

			SubSubclass = Subclass.extend({
				data: { bar: 2 },
				partials: { bar: 'barPartial' },
				transitions: { shimmy: function ( t ) { shimmied = true; } }
			});

			instance = new SubSubclass({
				el: fixture,
				data: { baz: 3 },
				partials: { baz: 'bazPartial' }
			});

			t.htmlEqual( fixture.innerHTML, '<div>fooPartialbarPartialbazPartial</div><div>123</div>' );
			t.ok( wiggled );
			t.ok( shimmied );
		});

		test( 'Multiple identical evaluators merge', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '{{( a+b )}} {{( a+b )}} {{( a+b )}}',
				data: { a: 1, b: 2 }
			});

			t.htmlEqual( fixture.innerHTML, '3 3 3' );

			t.equal( ractive.viewmodel.deps[ 'computed' ].a.length, 1 );
			t.equal( ractive.viewmodel.deps[ 'computed' ].b.length, 1 );
		});

		test( 'Boolean attributes work as expected', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input id="one" type="checkbox" checked="{{falsy}}"><input id="two" type="checkbox" checked="{{truthy}}">',
				data: { truthy: true, falsy: false }
			});

			t.equal( ractive.nodes.one.checked, false );
			t.equal( ractive.nodes.two.checked, true );
		});

		test( 'Instances can be created without an element', function ( t ) {
			var ractive;

			ractive = new Ractive({
				template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
				data: { items: [ 'a', 'b', 'c' ] }
			});

			t.ok( ractive );
		});

		test( 'Instances without an element can render HTML', function ( t ) {
			var ractive;

			ractive = new Ractive({
				template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
				data: { items: [ 'a', 'b', 'c' ] }
			});

			t.htmlEqual( ractive.toHTML(), '<ul><li>0: a</li><li>1: b</li><li>2: c</li></ul>' );
		});

		test( 'Triples work with toHTML', function ( t ) {
			var ractive;

			ractive = new Ractive({
				template: '{{{ triple }}}',
				data: { triple: '<p>test</p>' }
			});

			t.htmlEqual( ractive.toHTML(), '<p>test</p>' );
		});

		test( 'Passing in alternative delimiters', function ( t ) {
			var ractive = new Ractive({
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

		test( 'Using alternative delimiters in template', function ( t ) {
			var ractive = new Ractive({
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

		test( '.unshift() works with proxy event handlers, without index references', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<button on-click="bla">Level1: {{ title }}</button>{{/items}}',
				data: {
					items: [{ title: 'Title1' }]
				}
			});

			ractive.get('items').unshift({title: 'Title0'});

			t.htmlEqual( fixture.innerHTML, '<button>Level1: Title0</button><button>Level1: Title1</button>' );
		});

		test( 'Updating values with properties corresponding to unresolved references works', function ( t ) {
			var ractive, user;

			user = {};

			ractive = new Ractive({
				el: fixture,
				template: '{{#user}}{{name}}{{/user}}',
				data: { user: user }
			});

			t.equal( fixture.innerHTML, '' );
			user.name = 'Jim';
			ractive.update( 'user' );
			t.equal( fixture.innerHTML, 'Jim' );
		});

		test( 'Setting nested properties with a keypath correctly updates value of intermediate keypaths', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}{{#bar}}{{baz}}{{/bar}}{{/foo}}'
			});

			ractive.set( 'foo.bar.baz', 'success' );

			t.htmlEqual( fixture.innerHTML, 'success' );
		});

		test( 'Functions are called with the ractive instance as context', function ( t ) {
			expect( 1 );

			var ractive = new Ractive({
				el: fixture,
				template: '{{ foo() }}'
			});

			ractive.set( 'foo', function () {
				t.equal( this, ractive );
			});
		});

		test( 'Methods are called with their object as context', function ( t ) {
			expect( 1 );

			var foo, run, ractive = new Ractive({
				el: fixture,
				template: '{{ foo.bar() }}'
			});

			foo = {
				bar: function () {
					// TODO why is this running twice?
					if ( !run ) {
						t.equal( this, foo );
					}

					run = true;
				}
			};

			ractive.set( 'foo', foo );
		});

		test( 'Delimiters can be reset globally', function ( t ) {
			var oldDelimiters, oldTripledDelimiters, ractive;

			oldDelimiters = Ractive.defaults.delimiters;
			oldTripledDelimiters = Ractive.defaults.tripleDelimiters;

			Ractive.defaults.delimiters = [ '/~', '~/' ];
			Ractive.defaults.tripleDelimiters = [ '/~~', '~~/' ];

			ractive = new Ractive({
				el: fixture,
				template: '/~foo~/ /~~bar~~/',
				data: { foo: 'text', bar: '<strong>html</strong>' }
			});

			t.htmlEqual( fixture.innerHTML, 'text <strong>html</strong>' );

			Ractive.defaults.delimiters = oldDelimiters;
			Ractive.defaults.tripleDelimiters = oldTripledDelimiters;
		});

		test( 'Teardown works without throwing an error (#205)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: 'a {{generic}} template',
				data: { generic: 'bog standard' }
			});

			expect( 1 );

			try {
				ractive.teardown();
				t.ok( 1 );
			} catch ( err ) {
				t.ok( 0 );
			}
		});

		test( 'Bindings without explicit keypaths can survive a splice operation', function ( t ) {
			var items, ractive;

			items = new Array( 3 );

			ractive = new Ractive({
				el: fixture,
				template: '<ul>{{#items}}<li><input value="{{foo}}"></li>{{/items}}</ul>',
				data: { items: items }
			});

			expect( 1 );

			items.splice( 1, 1 );
			try {
				items.splice( 1, 1 );
				t.ok( 1 );
			} catch ( err ) {
				t.ok( 0 );
			}
		});

		test( 'Keypath resolutions that trigger teardowns don\'t cause the universe to implode', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{^foo}}not foo{{/foo}}{{#foo}}<widget items="{{items}}"/>{{/foo}}',
				data: { items: [ 1, 2 ] },
				components: {
					widget: Ractive.extend({ template: 'widget' })
				}
			});

			expect( 1 );

			try {
				ractive.set( 'foo', true );
				t.ok( 1 );
			} catch ( err ) {
				t.ok( 0 );
			}
		});

		test( 'Inverted sections aren\'t broken by unshift operations', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{^items}}no items{{/items}}{{#items}}{{.}}{{/items}}',
				data: { items: [] }
			});

			t.htmlEqual( fixture.innerHTML, 'no items' );
			ractive.get( 'items' ).unshift( 'foo' );
			t.htmlEqual( fixture.innerHTML, 'foo' );
		});

		test( 'Splice operations that try to remove more items than there are from an array are handled', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{.}}{{/items}}',
				data: { items: [ 'a', 'b', 'c' ] }
			});

			t.htmlEqual( fixture.innerHTML, 'abc' );
			ractive.get( 'items' ).splice( 2, 2 );
			t.htmlEqual( fixture.innerHTML, 'ab' );
		});

		test( 'Partial templates will be drawn from script tags if not already registered', function ( t ) {
			var partialScr, ractive;

			partialScr = document.createElement( 'script' );
			partialScr.id = 'thePartial';
			partialScr.type = 'text/ractive';
			partialScr.text = '{{one}}{{two}}{{three}}';

			document.getElementsByTagName('body')[0].appendChild( partialScr );

			ractive = new Ractive({
				el: fixture,
				template: '{{>thePartial}}',
				data: { one: 1, two: 2, three: 3 }
			});

			t.htmlEqual( fixture.innerHTML, '123' );
		});

		// ARGH these tests don't work in phantomJS
		/*test( 'ractive.detach() removes an instance from the DOM and returns a document fragment', function ( t ) {
			var ractive, p, docFrag;

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p>',
				data: { foo: 'whee!' }
			});

			p = ractive.find( 'p' );

			docFrag = ractive.detach();
			t.ok( docFrag instanceof DocumentFragment );
			t.ok( docFrag.contains( p ) );
		});

		test( 'ractive.detach() works with a previously unrendered ractive', function ( t ) {
			var ractive, p, docFrag;

			ractive = new Ractive({
				template: '<p>{{foo}}</p>',
				data: { foo: 'whee!' }
			});

			p = ractive.find( 'p' );

			docFrag = ractive.detach();
			t.ok( docFrag instanceof DocumentFragment );
			t.ok( docFrag.contains( p ) );
		});*/

		test( 'ractive.insert() moves an instance to a different location', function ( t ) {
			var ractive, p, one, two, three;

			one = document.createElement( 'div' );
			two = document.createElement( 'div' );

			three = document.createElement( 'div' );
			three.innerHTML = '<p>before</p><p class="after">after</p>';

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p>',
				data: { foo: 'whee!' }
			});

			p = ractive.find( 'p' );

			ractive.insert( one );
			t.ok( one.contains( p ) );

			ractive.insert( two );
			t.ok( !one.contains( p ) );
			t.ok( two.contains( p ) );

			ractive.insert( three, three.querySelector( '.after' ) );
			t.ok( three.contains( p ) );
			t.htmlEqual( three.innerHTML, '<p>before</p><p>whee!</p><p class="after">after</p>' );
		});

		test( 'ractive.insert() throws an error if instance is not rendered (#712)', function ( t ) {
			var ractive, p, one, two, three;

			one = document.createElement( 'div' );
			two = document.createElement( 'div' );

			three = document.createElement( 'div' );
			three.innerHTML = '<p>before</p><p class="after">after</p>';

			ractive = new Ractive({
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
			p = ractive.find( 'p' );
			t.ok( !one.contains( p ) );
			t.ok( two.contains( p ) );

			ractive.insert( three, three.querySelector( '.after' ) );
			t.ok( three.contains( p ) );
			t.htmlEqual( three.innerHTML, '<p>before</p><p>whee!</p><p class="after">after</p>' );
		});

		test( 'Regression test for #271', function ( t ) {
			var ractive, items;

			items = [{}];
			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<p>foo</p>{{# items.length > 1 }}<p>bar</p>{{/}}{{/items}}',
				data: { items: items }
			});

			t.htmlEqual( fixture.innerHTML, '<p>foo</p>' );

			try {
				items.push({});
				t.htmlEqual( fixture.innerHTML, '<p>foo</p><p>bar</p><p>foo</p><p>bar</p>' );
				items.push({});
				t.htmlEqual( fixture.innerHTML, '<p>foo</p><p>bar</p><p>foo</p><p>bar</p><p>foo</p><p>bar</p>' );

				items.splice( 1, 1 );
				t.htmlEqual( fixture.innerHTML, '<p>foo</p><p>bar</p><p>foo</p><p>bar</p>' );
				items.splice( 1, 1 );
				t.htmlEqual( fixture.innerHTML, '<p>foo</p>' );
			} catch ( err ) {
				t.ok( false );
			}
		});

		test( 'Regression test for #297', function ( t ) {
			var ractive, items;

			items = [ 'one', 'two', 'three' ];

			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{>item}}{{/items}}',
				data: { items: items },
				partials: {
					item: '<p>{{.}}</p>'
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>one</p><p>two</p><p>three</p>' );

			items.splice( 1, 1 );
			t.htmlEqual( fixture.innerHTML, '<p>one</p><p>three</p>' );
		});

		test( 'Regression test for #316', function ( t ) {
			var ractive, a, b;

			a = [];
			b = [];

			ractive = new Ractive({
				el: fixture,
				template: '{{ a.length ? "foo" : b.length ? "bar" : "baz" }}',
				data: { a: a, b: b }
			});

			t.htmlEqual( fixture.innerHTML, 'baz' );

			b.push( 1 );
			t.htmlEqual( fixture.innerHTML, 'bar' );

			a.push( 1 );
			t.htmlEqual( fixture.innerHTML, 'foo' );
		});

		test( 'Regression test for #321', function ( t ) {
			var ractive, buttons, expected;

			ractive = new Ractive({
				el: fixture,
				template: '<button on-click=\'test:{{ ["just a string"] }}\'>test 1</button><button on-click=\'test:{{ {bar: 3} }}\'>test 2</button>'
			});

			ractive.on( 'test', function ( event, arg ) {
				t.deepEqual( arg, expected );
			});

			expect( 2 );
			buttons = ractive.findAll( 'button' );

			expected = ['just a string'];
			simulant.fire( buttons[0], 'click' );

			expected = { bar: 3 };
			simulant.fire( buttons[1], 'click' );
		});

		test( 'Evaluators that have a value of undefined behave correctly', function ( t ) {
			var ractive = new Ractive({
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

		test( 'Components inherit adaptors from their parent', function ( t ) {
			var ractive;

			Ractive.components.widget = Ractive.extend({
				template: '<p>{{wrappedThing}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget wrappedThing="{{thing}}"/>',
				adapt: [ 'foo' ],
				data: {
					thing: new Foo( 'whee!' )
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>whee!</p>' );
		});

		test( 'Components made with Ractive.extend() can include adaptors', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				adapt: [ 'foo' ]
			});

			ractive = new Widget({
				el: fixture,
				template: '<p>{{thing}}</p>',
				data: {
					thing: new Foo( 'whee!' )
				}
			});

			t.deepEqual( ractive.adapt, [ Ractive.adaptors.foo ] );
			t.htmlEqual( fixture.innerHTML, '<p>whee!</p>' );
		});

		test( 'Two-way binding can be set up against expressions that resolve to regular keypaths', function ( t ) {
			var ractive, input;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<label><input value="{{ proxies[i].name }}"> name: {{ proxies[i].name }}</label>{{/items}}',
				data: {
					items: [{}],
					proxies: []
				}
			});

			input = ractive.find( 'input' );
			input.value = 'foo';
			ractive.updateModel();

			t.deepEqual( ractive.get( 'proxies' ), [{name: 'foo'  }] );
			t.htmlEqual( fixture.innerHTML, '<label><input> name: foo</label>' );
		});

		test( 'Instances of subclasses with non-POJO default models have the correct prototype', function ( t ) {
			var Model, Subclass, instance;

			Model = function ( data ) {
				var key;

				for ( key in data ) {
					if ( data.hasOwnProperty( key ) ) {
						this[ key ] = data[ key ];
					}
				}
			};

			Model.prototype.test = function () {
				t.ok( true );
			};

			Subclass = Ractive.extend({
				data: function () {
					return new Model({
						foo: 'bar'
					})
				}
			});

			instance = new Subclass({
				el: fixture,
				template: '{{foo}}{{bar}}',
				data: {
					bar: 'baz'
				}
			});

			t.ok( instance.data instanceof Model );
		});

		test( 'Regression test for #798', function ( t ) {
			var ClassA, ClassB, ractive;

			ClassB = function () {};
			ClassA = function () {};
			ClassA.prototype.resources = new ClassB();

			ractive = new Ractive({
				el: fixture,
				template: '<widget attr="{{item.resources}}"/>',
				data: { item: new ClassA() },
				components: {
					widget: Ractive.extend({})
				}
			});

			t.ok( ractive.findComponent('widget').data.attr instanceof ClassB );
		});

		asyncTest( 'Subclass instance complete() handlers can call _super', function ( t ) {
			var Subclass, instance;

			expect( 1 );

			Subclass = Ractive.extend({
				complete: function () {
					return 42;
				}
			});

			instance = new Subclass({
				el: fixture,
				complete: function () {
					t.equal( this._super(), 42 );
					start();
				}
			});
		});


		test( 'ractive.insert() with triples doesn\'t invoke Yoda (#391)', function ( t ) {
			var ractive = new Ractive({
				el: document.createElement( 'div' ),
				template: '{{{value}}}',
				data: {
					'value': ' you are <i>very puzzled now</i>'
				}
			});

			ractive.insert( fixture );
			t.htmlEqual( fixture.innerHTML, ' you are <i>very puzzled now</i>' );
		});


		test( '<input value="{{foo}}"> where foo === null should not render a value (#390)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}">',
				data: {
					foo: null
				}
			});

			t.equal( ractive.find( 'input' ).value, '' );
		});

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

			test( 'Array mutators work when `magic` is `true` (#376)', function ( t ) {
				var ractive, items;

				items = [
					{ name: 'one' },
					{ name: 'two' },
					{ name: 'three' }
				];

				ractive = new Ractive({
					el: fixture,
					template: '{{#items}}{{name}}{{/items}}',
					magic: true,
					data: {
						items: items
					}
				});

				ractive.data.items.push({ name: 'four' });

				t.htmlEqual( fixture.innerHTML, 'onetwothreefour' );
			});

			test( 'Implicit iterators work in magic mode', function ( t ) {
				var ractive, items;

				items = [
					{ name: 'one' },
					{ name: 'two' },
					{ name: 'three' }
				];

				ractive = new Ractive({
					el: fixture,
					template: '{{#.}}{{name}}{{/.}}',
					magic: true,
					data: items
				});

				t.htmlEqual( fixture.innerHTML, 'onetwothree' );

				ractive.data[2].name = 'threefourfive';
				t.htmlEqual( fixture.innerHTML, 'onetwothreefourfive' );
			});

			obj.foo = 'bar';
		} catch ( err ) {
			// do nothing
		}

		test( 'Foo.extend(Bar), where both Foo and Bar are Ractive instances, returns on object that inherits from Foo and Bar', function ( t ) {
			var Human, Spider, Spiderman, spiderman;

			Human = Ractive.extend({
				template: '<p>type: {{type}}</p>',

				talk: function () {
					return 'hello';
				}
			});

			Spider = Ractive.extend({
				// registries
				data: {
					type: 'arachnid'
				},

				// defaults
				lazy: true,

				// methods
				climb: function () {
					return 'climbing';
				},

				talk: function () {
					return this._super() + ' my name is Peter Parker';
				}
			});

			Spiderman = Human.extend( Spider );

			spiderman = new Spiderman({
				el: fixture
			});

			t.htmlEqual( fixture.innerHTML, '<p>type: arachnid</p>' );
			t.ok( spiderman.lazy );
			t.equal( spiderman.climb(), 'climbing' );
			t.equal( spiderman.talk(), 'hello my name is Peter Parker' );
		});


		test( 'Regression test for #460', function ( t ) {
			var items, ractive, baz;

			items = [
				{ desc: 'foo' },
				{ desc: 'bar' },
				{ desc: 'baz' }
			]

			ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<p>{{desc}}:{{missing[data]}}</p>{{/items}}',
				data: { items: items }
			});

			baz = items.pop();
			t.htmlEqual( fixture.innerHTML, '<p>foo:</p><p>bar:</p>' );

			items.push( baz );
			t.htmlEqual( fixture.innerHTML, '<p>foo:</p><p>bar:</p><p>baz:</p>' );
		});

		test( 'Regression test for #457', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#step.current == step.current}}<p>{{foo}}</p>{{/step.current == step.current}}'
			});

			ractive.set({
				"foo": "bar",
				"step": {
					"current": 2
				}
			});
			t.ok( true );
		});

		if ( Ractive.svg ) {
			test( 'Triples work inside SVG elements', function ( t ) {
				var text, ractive = new Ractive({
					el: document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ),
					template: '{{{code}}}',
					data: {
						code: '<text>works</text>'
					}
				});

				text = ractive.find( 'text' );
				t.ok( !!text );
				t.equal( text.namespaceURI, 'http://www.w3.org/2000/svg' );
			});
		}

		test( 'Custom delimiters apply to partials (#601)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '([#items:i])([>foo])([/items])',
				partials: { foo: '([a])' },
				data: { items: [{a:0},{a:1}] },
				delimiters: [ '([', '])' ],
				tripleDelimiters: [ '([[', ']])' ]
			});

			t.htmlEqual( fixture.innerHTML, '01')
		});

		test( 'Rendering to an element, if `append` is false, causes any existing instances to be torn down', function ( t ) {
			var ractive1, ractive2;

			expect( 2 );

			ractive1 = new Ractive({
				el: fixture,
				template: 'foo'
			});

			ractive1.on( 'teardown', function () {
				t.ok( true );
			});

			ractive2 = new Ractive({
				el: fixture,
				template: 'bar'
			});

			t.htmlEqual( fixture.innerHTML, 'bar' );
		});

		if ( Ractive.svg ) {
			test( 'Children of foreignObject elements default to html namespace (#713)', function ( t ) {
				var ractive = new Ractive({
					el: fixture,
					template: '<svg><foreignObject><p>foo</p></foreignObject></svg>'
				});

				// We can't do `ractive.find( 'foreignObject' )` because of a longstanding browser bug
				// (https://bugs.webkit.org/show_bug.cgi?id=83438)
				t.equal( ractive.find( 'svg' ).firstChild.namespaceURI, 'http://www.w3.org/2000/svg' );
				t.equal( ractive.find( 'p' ).namespaceURI, 'http://www.w3.org/1999/xhtml' );
			});
		}

		// This test fails since #816, because evaluators are treated as computed properties.
		// Kept here in case we come up with a smart way to have the best of both worlds
		/*test( 'Evaluators are not called if their expressions no longer exist (#716)', function ( t ) {
			var ractive, doubled = 0, tripled = 0;

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

		test( 'Regression test for #695 (unrendering non-rendered items)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{# { items: nested.items } }}{{#insert}}{{#items}}<div decorator="foo"></div>{{/items}}{{/insert}}{{/}}',
				decorators: {
					foo: function () { return { teardown: function () {} }; }
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

		asyncTest( 'A Promise will be rejected if its callback throws (#759)', function ( t ) {
			var p = new Ractive.Promise( function () {
				throw 'ruh-roh';
			});

			p.then( null, function ( err ) {
				t.equal( err, 'ruh-roh' );
				QUnit.start();
			});
		});

		test( 'Keypaths in ractive.set() can contain wildcards (#784)', function ( t ) {
			var ractive = new Ractive({
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

		test( 'Wildcard keypaths do not affect array length', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{array.length}}',
				data: {
					array: [ 1, 2, 3 ]
				}
			});

			ractive.set( 'array.*', 10 );
			t.deepEqual( ractive.get( 'array.length' ), 3 );
		});

		test( 'Regression test for #801', function ( t ) {
			var ractive = new Ractive({
				el: document.createElement( 'div' ),
				template: '<div>{{#(foo !== "bar")}}not bar{{#(foo !== "baz")}}not baz{{/()}}{{/()}}</div>',
				data: {
					foo: 'baz'
				}
			});

			ractive.set( 'foo', 'bar' );
			t.ok( true );
		});

		test( 'Regression test for #832', function ( t ) {
			var ractive = new Ractive({
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

		test( 'Regression test for #857', function ( t ) {
			var ractive = new Ractive({
				el: document.createElement( 'div' ),
				template: '<textarea value="{{foo}}"></textarea>',
				data: {
					foo: 'works'
				}
			});

			t.equal( ractive.find( 'textarea' ).value, 'works' );
		});

		test( 'Radio input can have name/checked attributes without two-way binding (#783)', function ( t ) {
			expect( 0 );

			var ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" name="a" value="a" checked>'
			});
		});

		asyncTest( 'Complete handlers are called for lazily-rendered instances (#749)', function ( t ) {
			expect( 1 );

			var ractive = new Ractive({
				template: '<p>foo</p>',
				complete: function () {
					t.ok( true );
					ractive.teardown();
					QUnit.start();
				}
			});

			ractive.render( fixture );
		});

		test( 'Doctype declarations are handled, and the tag name is uppercased (#877)', function ( t ) {
			var ractive = new Ractive({
				template: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>{{title}}</title></head><body>{{hello}} World!</body></html>',
				data: { title: 'hi', hello: 'Hello' }
			});

			t.equal( ractive.toHTML(), '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>hi</title></head><body>Hello World!</body></html>' );
		});

		test( 'Resolvers are torn down (#884)', function ( t ) {
			var ractive = new Ractive({
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

			expect( 0 );

			ractive.set( 'foo', true );
			ractive.set( 'foo', false );
			ractive.set( 'currentStep', 1 );
		});

		test( 'Regression test for #844', function ( t ) {
			var ractive = new Ractive({
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
					steps: [{}, {}],
					bool: true
				}
			});

			ractive.set( 'currentStep', null );
			ractive.set( 'currentStep', 1 );

			t.htmlEqual( fixture.innerHTML, 'some text  <a>toggle step: 0</a>' );

			ractive.set( 'currentStep', 0 );
			t.htmlEqual( fixture.innerHTML, 'some text  <a>toggle step: 1</a>' );
		});

		test( 'Mustaches that re-resolve to undefined behave correctly (#908)', function ( t ) {
			var ractive = new Ractive({
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

		test( 'Content renders to correct place when subsequent sections have no nodes (#910)', function ( t ) {
			var ractive = new Ractive({
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

		test( 'Dependants can register more than once without error (#838)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#if foo}}<p>{{fn(foo)}}</p>{{/if}}',
				data: {
					fn: function ( foo ) {
						foo.bar;
						this.get( 'foo' );
						this.get( 'bar' );
					}
				}
			});

			expect( 0 );

			ractive.set( 'foo', {} );
			ractive.set( 'foo', null );
		});

		test( 'Ractive.extend() with parsed template (#939)', function ( t ) {
			var parsed, Widget, ractive;

			parsed = Ractive.parse( '<p>{{foo}}</p>' );
			Widget = Ractive.extend({ template: parsed });

			ractive = new Widget({ data: { foo: 'bar' }});
			t.equal( ractive.toHTML(), '<p>bar</p>' );
		});

		test( 'Regression test for #950', function ( t ) {
			var ractive, select;

			expect( 0 );

			ractive = new Ractive({
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
					items: ["Apples", "Oranges", "Samsungs"]
				}
			});

			ractive.observe('selected', function() {
				ractive.set('editing', false);
			}, { init: false });

			ractive.on('done-selecting', function( event ) {
				ractive.set('editing', false);
			});

			select = ractive.find( 'select' );
			select.focus();
			select.options[2].selected = true;
			simulant.fire( select, 'change' );
		});

		test( 'Custom delimiters apply to inline partials (#990)', function ( t ) {
			var ractive = new Ractive({
				template: '<!-- ([>a]) --> abc <!-- ([/a]) -->',
				delimiters: [ '([', '])' ]
			});

			t.deepEqual( ractive.partials, { a : [ 'abc' ] });
		});

		asyncTest( 'Regression test for #1019', function ( t ) {
			var ractive, img, int, i;

			ractive = new Ractive({
				el: fixture,
				template: '<img src="../samples/350x150.gif" width="{{350}}">'
			});

			img = ractive.find( 'img' );

			i = 0;
			int = setInterval( function () {
				if ( img.complete || i++ === 20 ) {
					clearInterval( int );
					t.equal( img.width, 350 );
					QUnit.start();
				}
			}, 100);
		});

		asyncTest( 'Another regression test for #1019', function ( t ) {
			var ractive, img, int, i;

			ractive = new Ractive({
				el: fixture,
				template: '<div style="width: 350px"><img src="../samples/350x150.gif" width="100%"></div>'
			});

			img = ractive.find( 'img' );

			i = 0;
			int = setInterval( function () {
				if ( img.complete || i++ === 20 ) {
					clearInterval( int );
					t.equal( img.width, 350 );
					QUnit.start();
				}
			}, 100);
		});

		test( 'Regression test for #1003', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: `
					{{#unless foo}}y{{/unless}}

					<select value="{{foo}}">
						<option>x</option>
					</select>`
			});

			t.htmlEqual( fixture.innerHTML, '<select><option>x</option></select>' );
		});

		test( 'Regression test for #1055', function ( t ) {
			var _, ractive;

			_ = {
				bind: function () {
					// do nothing
				},
				uppercase: function ( str ) {
					return str.toUpperCase();
				}
			};

			ractive = new Ractive({
				el: fixture,
				template: '{{_.uppercase(str)}}',
				data: {
					_: _,
					str: 'foo'
				}
			});

			t.htmlEqual( fixture.innerHTML, 'FOO' );
		});

		test( 'Interpolation of script/style contents can be disabled (#1050)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<script>window.TEST_VALUE = "{{uninterpolated}}";</script>',
				data: { uninterpolated: 'whoops' },
				interpolate: { script: false }
			});

			t.equal( window.TEST_VALUE, '{{uninterpolated}}' );
			delete window.TEST_VALUE;
		});

		test( 'Changing the length of a section has no effect to detached ractives until they are reattached (#1053)', function ( t ) {
			var ractive = new Ractive({
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

		asyncTest( 'Regression test for #1038', function ( t ) {
 			expect( 0 );

			var el, ractive;

			el = document.createElement( 'div' );
			ractive = new Ractive({
				el: el,
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

			ractive.set('obj.loading', true);

			setTimeout( function () {
				ractive.set('obj.error', true);
				ractive.set('obj.loading', false);

				QUnit.start();
			}, 100 );
		});

		test( 'Reference expressions can become invalid after being valid, without breaking (#1106)', function ( t ) {
			var ractive = new Ractive({
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
			ractive.set( 'i', 1 );
			ractive.set( 'i', null );
			ractive.set( 'i', 2 );

			t.htmlEqual( fixture.innerHTML, 'c' );
		});

		// These tests run fine in the browser but not in PhantomJS. WTF I don't even.
		// Anyway I can't be bothered to figure it out right now so I'm just commenting
		// these out so it will build

		/*test( 'Components with two-way bindings set parent values on initialisation', function ( t ) {
			var Dropdown, ractive;

			Dropdown = Ractive.extend({
				template: '<select value="{{value}}">{{#options}}<option value="{{this}}">{{ this[ display ] }}</option>{{/options}}</select>'
			});

			ractive = new Ractive({
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



		{
			name: 'Tearing down expression mustaches and recreating them does\'t throw errors',
			test: function () {
				var ractive;

				ractive = new Ractive({
					el: fixture,
					template: '{{#condition}}{{( a+b )}} {{( a+b )}} {{( a+b )}}{{/condition}}',
					data: { a: 1, b: 2, condition: true }
				});

				equal( fixture.innerHTML, '3 3 3' );

				ractive.set( 'condition', false );
				equal( fixture.innerHTML, '' );

				ractive.set( 'condition', true );
				equal( fixture.innerHTML, '3 3 3' );
			}
		},
		{
			name: 'Updating an expression section doesn\'t throw errors',
			test: function () {
				var ractive, array;

				array = [{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }, { foo: 5 }];

				ractive = new Ractive({
					el: fixture,
					template: '{{#( array.slice( 0, 3 ) )}}{{foo}}{{/()}}',
					data: { array: array }
				});

				equal( fixture.innerHTML, '123' );

				array.push({ foo: 6 });
				equal( fixture.innerHTML, '123' );

				array.unshift({ foo: 0 });
				equal( fixture.innerHTML, '012' );

				ractive.set( 'array', [] );
				equal( array._ractive, undefined );
				equal( fixture.innerHTML, '' );

				ractive.set( 'array', array );
				ok( array._ractive );
				equal( fixture.innerHTML, '012' );
			}
		},
		{
			name: 'Updating a list section with child list expressions doesn\'t throw errors',
			test: function () {
				var ractive, array;

				array = [
					{ foo: [ 1, 2, 3, 4, 5 ] },
					{ foo: [ 2, 3, 4, 5, 6 ] },
					{ foo: [ 3, 4, 5, 6, 7 ] },
					{ foo: [ 4, 5, 6, 7, 8 ] },
					{ foo: [ 5, 6, 7, 8, 9 ] }
				];

				ractive = new Ractive({
					el: fixture,
					template: '{{#array}}<p>{{#( foo.slice( 0, 3 ) )}}{{.}}{{/()}}</p>{{/array}}',
					data: { array: array }
				});

				equal( fixture.innerHTML, '<p>123</p><p>234</p><p>345</p><p>456</p><p>567</p>' );

				array.push({ foo: [ 6, 7, 8, 9, 10 ] });
				equal( fixture.innerHTML, '<p>123</p><p>234</p><p>345</p><p>456</p><p>567</p><p>678</p>' );

				array.unshift({ foo: [ 0, 1, 2, 3, 4 ] });
				equal( fixture.innerHTML, '<p>012</p><p>123</p><p>234</p><p>345</p><p>456</p><p>567</p><p>678</p>' );

				ractive.set( 'array', [] );
				equal( array._ractive, undefined );
				equal( fixture.innerHTML, '' );

				ractive.set( 'array', array );
				ok( array._ractive );
				equal( fixture.innerHTML, '<p>012</p><p>123</p><p>234</p><p>345</p><p>456</p><p>567</p><p>678</p>' );
			}
		}*/

	};

});
