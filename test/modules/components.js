define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Foo;

		module( 'Components' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'Static data is propagated from parent to child', function ( t ) {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="blah"/>',
				components: {
					widget: Widget
				}
			});

			widget = ractive.findComponent( 'widget' );

			t.equal( widget.get( 'foo' ), 'blah' );
			t.htmlEqual( fixture.innerHTML, '<p>blah</p>' );
		});

		test( 'Static object data is propagated from parent to child', function ( t ) {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo.bar}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{ { bar: \'biz\' } }}"/>',
				components: {
					widget: Widget
				}
			});

			widget = ractive.findComponent( 'widget' );
			t.deepEqual( widget.get( 'foo' ), { bar: 'biz' } );
			t.htmlEqual( fixture.innerHTML, '<p>biz</p>' );

			widget.set('foo.bar', 'bah')
			t.deepEqual( widget.get( 'foo' ), { bar: 'bah' } );
			t.htmlEqual( fixture.innerHTML, '<p>bah</p>' );
		});

		test( 'Dynamic data is propagated from parent to child, and (two-way) bindings are created', function ( t ) {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{bar}}"/>',
				components: {
					widget: Widget
				},
				data: {
					bar: 'blah'
				}
			});

			widget = ractive.findComponent( 'widget' );

			t.equal( widget.get( 'foo' ), 'blah' );
			t.htmlEqual( fixture.innerHTML, '<p>blah</p>' );

			ractive.set( 'bar', 'flup' );
			t.equal( widget.get( 'foo' ), 'flup' );
			t.htmlEqual( fixture.innerHTML, '<p>flup</p>' );

			widget.set( 'foo', 'shmup' );
			t.equal( ractive.get( 'bar' ), 'shmup' );
			t.htmlEqual( fixture.innerHTML, '<p>shmup</p>' );
		});

		// Commenting out this test for the moment - is this a desirable feature?
		// It prevents JavaScript closure-like behaviour with data contexts
		/*test( 'Missing data on the parent is not propagated', function ( t ) {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{missing}}"/>',
				components: {
					widget: Widget
				}
			});

			widget = ractive.findComponent( 'widget' );

			t.ok( !( widget.data.hasOwnProperty( 'foo' ) ) );
			t.htmlEqual( fixture.innerHTML, '<p></p>' );
		});*/

		test( 'Missing data on the parent is added when set', function ( t ) {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{missing}}"/>',
				components: {
					widget: Widget
				}
			});

			widget = ractive.findComponent( 'widget' );

			t.htmlEqual( fixture.innerHTML, '<p></p>' );

			ractive.set('missing', 'found')
			t.ok( widget.data.hasOwnProperty( 'foo' ) );
			t.htmlEqual( fixture.innerHTML, '<p>found</p>' );

		});

		test( 'Data on the child is propagated to the parent, if it is not missing', function ( t ) {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo}}{{bar}}</p>',
				data: {
					foo: 'yes'
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{one}}" bar="{{two}}"/>',
				components: {
					widget: Widget
				}
			});

			widget = ractive.findComponent( 'widget' );

			t.equal( ractive.get( 'one' ), 'yes' );
			t.ok( !( ractive.data.hasOwnProperty( 'two' ) ) );
			t.htmlEqual( fixture.innerHTML, '<p>yes</p>' );
		});

		test( 'Parent data overrides child data during child model creation', function ( t ) {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo}}{{bar}}</p>',
				data: {
					foo: 'yes',
					bar: 'no'
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{one}}" bar="{{two}}"/>',
				components: {
					widget: Widget
				},
				data: {
					one: 'uno',
					two: 'dos'
				}
			});

			widget = ractive.findComponent( 'widget' );

			t.equal( ractive.get( 'one' ), 'uno' );
			t.equal( ractive.get( 'two' ), 'dos' );
			t.equal( widget.get( 'foo' ), 'uno' );
			t.equal( widget.get( 'bar' ), 'dos' );

			t.htmlEqual( fixture.innerHTML, '<p>unodos</p>' );
		});

		test( 'Components are rendered in the correct place', function ( t ) {
			var Component, ractive;

			Component = Ractive.extend({
				template: '<p>this is a component!</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<h2>Here is a component:</h2><component/><p>(that was a component)</p>',
				components: {
					component: Component
				}
			});

			t.htmlEqual( fixture.innerHTML, '<h2>Here is a component:</h2><p>this is a component!</p><p>(that was a component)</p>' );
		});

		test( 'Top-level sections in components are updated correctly', function ( t ) {
			var ractive, Component, component;

			Component = Ractive.extend({
				template: '{{#foo}}foo is truthy{{/foo}}{{^foo}}foo is falsy{{/foo}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<component foo="{{foo}}"/>',
				components: {
					component: Component
				}
			});

			t.htmlEqual( fixture.innerHTML, 'foo is falsy' );

			ractive.set( 'foo', true );
			t.htmlEqual( fixture.innerHTML, 'foo is truthy' );
		});

		test( 'Element order is maintained correctly with components with multiple top-level elements', function ( t ) {
			var ractive, TestComponent;

			TestComponent = Ractive.extend({
				template: '{{#bool}}TRUE{{/bool}}{{^bool}}FALSE{{/bool}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>before</p> <test bool="{{bool}}"/> <p>after</p>',
				components: { test: TestComponent }
			});

			t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );

			ractive.set( 'bool', true );
			t.htmlEqual( fixture.innerHTML, '<p>before</p> TRUE <p>after</p>' );

			ractive.set( 'bool', false );
			t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );
		});

		test( 'Regression test for #317', function ( t ) {
			var Widget, widget, ractive, items;

			Widget = Ractive.extend({
				template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
				init: function () {
					widget = this;
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget items="{{items}}"/><p>{{ items.join( " " ) }}</p>',
				data: { items: [ 'a', 'b', 'c', 'd' ] },
				components: {
					widget: Widget
				}
			});

			items = ractive.get( 'items' );

			t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li></ul><p>a b c d</p>' );

			items.push( 'e' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li><li>4: e</li></ul><p>a b c d e</p>' );

			items.splice( 2, 1 );
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li><li>3: e</li></ul><p>a b d e</p>' );

			items.pop();
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li></ul><p>a b d</p>' );

			ractive.set( 'items[0]', 'f' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li></ul><p>f b d</p>' );


			// reset items from within widget
			widget.set( 'items', widget.get( 'items' ).slice() );
			items = ractive.get( 'items' );

			items.push( 'g' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li><li>3: g</li></ul><p>f b d g</p>' );

			items.splice( 1, 1 );
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li><li>2: g</li></ul><p>f d g</p>' );

			items.pop();
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li></ul><p>f d</p>' );

			widget.set( 'items[0]', 'h' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>0: h</li><li>1: d</li></ul><p>h d</p>' );
		});

		asyncTest( 'Component complete() methods are called', function ( t ) {
			var ractive, Widget, counter, done;

			expect( 2 );

			counter = 2;
			done = function () { --counter || start(); };

			Widget = Ractive.extend({
				complete: function () {
					t.ok( true );
					done();
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				complete: function () {
					t.ok( true );
					done();
				},
				components: {
					widget: Widget
				}
			});
		});

		test( 'Components can access outer data context, in the same way JavaScript functions can access outer lexical scope', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '<p>{{foo || "missing"}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/><widget foo="{{bar}}"/><widget foo="{{baz}}"/>',
				data: {
					foo: 'one',
					bar: 'two'
				},
				components: {
					widget: Widget
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>one</p><p>two</p><p>missing</p>' );

			ractive.set({
				foo: 'three',
				bar: 'four',
				baz: 'five'
			});

			t.htmlEqual( fixture.innerHTML, '<p>three</p><p>four</p><p>five</p>' );
		});


		test( 'Nested components can access outer-most data context', function ( t ) {
			var ractive, Widget;

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				components: {
					widget: Ractive.extend({
						template: '<grandwidget/>',
						components: {
							grandwidget: Ractive.extend({
								template: 'hello {{world}}'
							})
						},
					})
				},
				data: { world: 'mars' }
			});

			t.htmlEqual( fixture.innerHTML, 'hello mars' );
			ractive.set('world', 'venus');
			t.htmlEqual( fixture.innerHTML, 'hello venus' );
		});

		test( 'Nested components registered at global Ractive can access outer-most data context', function ( t ) {
			var ractive, Widget;

			Ractive.components.widget = Ractive.extend({ template: '<grandwidget/>' });
			Ractive.components.grandwidget = Ractive.extend({ template: 'hello {{world}}' });

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				data: { world: 'mars' }
			});

			t.htmlEqual( fixture.innerHTML, 'hello mars' );
			ractive.set('world', 'venus');
			t.htmlEqual( fixture.innerHTML, 'hello venus' );

			/* This works, but is it risky to polute global for other tests? */
			delete Ractive.components.widget
			delete Ractive.components.grandwidget
		});

		asyncTest( 'Data passed into component updates inside component in magic mode', function ( t ) {
			var ractive, Widget;

			expect( 1 );

			Widget = Ractive.extend({
				template: '{{world}}',
				magic: true,
				complete: function(){
					this.data.world = 'venus'
					t.htmlEqual( fixture.innerHTML, 'venusvenus' );
					start();
				}
			});

			var data = { world: 'mars' }

			ractive = new Ractive({
				el: fixture,
				template: '{{world}}<widget world="{{world}}"/>',
				magic: true,
				components: { widget: Widget },
				data: data
			});
		});

		test( 'Data passed into component updates from outside component in magic mode', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{world}}',
				magic: true
			});

			var data = { world: 'mars' }
			ractive = new Ractive({
				el: fixture,
				template: '{{world}}<widget world="{{world}}"/>',
				magic: true,
				components: { widget: Widget },
				data: data
			});

			data.world = 'venus'

			t.htmlEqual( fixture.innerHTML, 'venusvenus' );
		});

		test( 'Component data passed but non-existent on parent data', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{exists}}{{missing}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget exists="{{exists}}" missing="{{missing}}"/>',
				components: { widget: Widget },
				data: { exists: 'exists' }
			});

			t.htmlEqual( fixture.innerHTML, 'exists' );
		});

		test( 'Some component data not included in invocation parameters', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{exists}}{{missing}}',
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget exists="{{exists}}"/>',
				components: { widget: Widget },
				data: { exists: 'exists' }
			});

			t.htmlEqual( fixture.innerHTML, 'exists' );
		});

		test( 'Some component data not included, with implicit sibling', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{exists}}{{also}}{{missing}}',
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#stuff:exists}}<widget exists="{{exists}}" also="{{.}}"/>{{/stuff}}',
				components: { widget: Widget },
				data: {
					stuff: {
						exists: 'also'
					}
				 }
			});

			t.htmlEqual( fixture.innerHTML, 'existsalso' );
		});

		test( 'Isolated components do not interact with ancestor viewmodels', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
				template: '{{foo}}.{{bar}}',
				isolated: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget foo="{{foo}}"/>',
				components: { widget: Widget },
				data: {
					foo: 'you should see me',
					bar: 'but not me'
				}
			});

			t.htmlEqual( fixture.innerHTML, 'you should see me.' );
		});

		test( 'Top-level list sections in components do not cause elements to be out of order (#412 regression)', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '{{#numbers:o}}<p>{{.}}</p>{{/numbers}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<h1>Names</h1><widget numbers="{{first}}"/><widget numbers="{{second}}"/>',
				components: {
					widget: Widget
				},
				data: {
					first: { one: 'one', two: 'two' },
					second: { three: 'three', four: 'four' }
				}
			});

			t.htmlEqual( fixture.innerHTML, '<h1>Names</h1><p>one</p><p>two</p><p>three</p><p>four</p>' );
		});

		test( 'Children do not nuke parent data when inheriting from ancestors', function ( t ) {
			var Widget, Block, ractive;

			Widget = Ractive.extend({
				template: '<p>value: {{thing.value}}</p>'
			});

			Block = Ractive.extend({
				template: '<widget thing="{{things.one}}"/><widget thing="{{things.two}}"/><widget thing="{{things.three}}"/>',
				components: { widget: Widget }
			});

			// YOUR CODE GOES HERE
			ractive = new Ractive({
				el: fixture,
				template: '<block/>',
				data: {
					things: {
						one: { value: 1 },
						two: { value: 2 },
						three: { value: 3 }
					}
				},
				components: {
					block: Block
				}
			});

			t.deepEqual( ractive.get( 'things' ), { one: { value: 1 }, two: { value: 2 }, three: { value: 3 } } )
		});

		test( 'Uninitialised implicit dependencies of evaluators that use inherited functions are handled', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '{{status()}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{status()}}-<widget/>',
				data: {
					status: function () {
						return this.get( '_status' );
					}
				},
				components: {
					widget: Widget
				}
			});

			t.htmlEqual( fixture.innerHTML, '-' );

			ractive.set( '_status', 'foo' );
			t.htmlEqual( fixture.innerHTML, 'foo-foo' );

			ractive.set( '_status', 'bar' );
			t.htmlEqual( fixture.innerHTML, 'bar-bar' );
		});

		asyncTest( 'Instances with multiple components still fire complete() handlers (#486 regression)', function ( t ) {
			var Widget, ractive, counter, done;

			Widget = Ractive.extend({
				template: 'foo',
				complete: function () {
					t.ok( true );
					done();
				}
			});

			expect( 3 );

			counter = 3;
			done = function () { --counter || start(); };

			ractive = new Ractive({
				el: fixture,
				template: '<widget/><widget/>',
				components: { widget: Widget },
				complete: function () {
					t.ok( true );
					done();
				}
			});
		});

		test( 'findComponent and findAllComponents work through {{>content}}', function ( t ) {

			var Wrapper, Component, ractive;

			Component = Ractive.extend({});
			Wrapper = Ractive.extend({
				template: '<p>{{>content}}</p>',
				components: {
					component: Component
				}
			});

			ractive = new Ractive({
				template: '<wrapper><component/></wrapper>',
				components: {
					wrapper: Wrapper,
					component: Component
				}
			});

			var find = ractive.findComponent('component'),
				findAll = ractive.findAllComponents('component');

			t.ok( find, 'component not found' );
			t.equal( findAll.length, 1);
		});

		test( 'Indirect changes propagate across components in magic mode (#480)', function ( t ) {
			var Blocker, ractive, blocker;

			Blocker = Ractive.extend({
				template: '{{foo.bar.baz}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo.bar.baz}}"><blocker foo="{{foo}}"/>',
				data: { foo: { bar: { baz: 50 } } },
				magic: true,
				components: { blocker: Blocker }
			});

			ractive.set( 'foo.bar.baz', 42 );
			t.equal( ractive.get( 'foo.bar.baz' ), 42 );

			ractive.data.foo.bar.baz = 1337;
			t.equal( ractive.data.foo.bar.baz, 1337 );
			t.equal( ractive.get( 'foo.bar.baz' ), 1337 );

			blocker = ractive.findComponent( 'blocker' );

			blocker.set( 'foo.bar.baz', 42 );
			t.equal( blocker.get( 'foo.bar.baz' ), 42 );

			blocker.data.foo.bar.baz = 1337;
			t.equal( blocker.data.foo.bar.baz, 1337 );
			t.equal( blocker.get( 'foo.bar.baz' ), 1337 );
		});

		test( 'Correct value is given to node._ractive.keypath when a component is torn down and re-rendered (#470)', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}<widget visible="{{visible}}"/>{{/foo}}',
				data: { foo: {}, visible: true },
				components: {
					widget: Ractive.extend({
						template: '{{#visible}}<p>{{test}}</p>{{/visible}}'
					})
				}
			});

			t.equal( ractive.find( 'p' )._ractive.keypath, '' );

			ractive.set( 'visible', false );
			ractive.set( 'visible', true );

			t.equal( ractive.find( 'p' )._ractive.keypath, '' );
		});

		test( 'Nested components fire the init() event correctly (#511)', function ( t ) {
			var ractive, Outer, Inner, outerInitCount = 0, innerInitCount = 0;

			Inner = Ractive.extend({
				init: function () {
					innerInitCount += 1;
				}
			});

			Outer = Ractive.extend({
				template: '<inner/>',
				init: function () {
					outerInitCount += 1;
				},
				components: { inner: Inner }
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}<outer/>{{/foo}}',
				data: { foo: false },
				components: { outer: Outer }
			});

			ractive.set( 'foo', true );

			// initCounts should have incremented synchronously
			t.equal( outerInitCount, 1, '<outer/> component should call init()' );
			t.equal( innerInitCount, 1, '<inner/> component should call init()' );
		});

		test( 'foo.bar should stay in sync between <one foo="{{foo}}"/> and <two foo="{{foo}}"/>', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<one foo="{{foo}}"/><two foo="{{foo}}"/>',
				components: {
					one: Ractive.extend({ template: '<p>{{foo.bar}}</p>' }),
					two: Ractive.extend({ template: '<p>{{foo.bar}}</p>' })
				}
			});

			ractive.set( 'foo', {} );
			t.htmlEqual( fixture.innerHTML, '<p></p><p></p>' );

			ractive.findComponent( 'one' ).set( 'foo.bar', 'baz' );
			t.htmlEqual( fixture.innerHTML, '<p>baz</p><p>baz</p>' );

			ractive.findComponent( 'two' ).set( 'foo.bar', 'qux' );
			t.htmlEqual( fixture.innerHTML, '<p>qux</p><p>qux</p>' );
		});

		test( 'Index references propagate down to non-isolated components', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<widget letter="{{.}}"/>{{/items}}',
				data: { items: [ 'a', 'b', 'c' ] },
				components: {
					widget: Ractive.extend({
						template: '<p>{{i}}: {{letter}}</p>'
					})
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: b</p><p>2: c</p>' );

			ractive.get( 'items' ).splice( 1, 1 );
			t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: c</p>' );
		});

		test( 'Component removed from DOM on tear-down with teardown override that calls _super', function ( t ) {

			var Widget = Ractive.extend({
					template: 'foo',
					teardown: function(){
						this._super();
					}
				});
			var ractive = new Ractive({
					el: fixture,
					template: '{{#item}}<widget/>{{/item}}',
					data: { item: {} },
					components: {
						widget: Widget
					}
				});

			t.htmlEqual( fixture.innerHTML, 'foo' );

			ractive.set( 'item' );
			t.htmlEqual( fixture.innerHTML, '' );
		});

		test( 'Component names cannot include underscores (#483)', function ( t ) {
			var Component, ractive;

			expect( 1 );

			Component = Ractive.extend({ template: '{{foo}}' });

			try {
				ractive = new Ractive({
					el: fixture,
					template: '<no_lo_dash/>',
					components: {
						no_lo_dash: Component
					}
				});
				t.ok( false );
			} catch ( err ) {
				t.ok( true );
			}
		});

		test( 'Data will propagate up through multiple component boundaries (#520)', function ( t ) {
			var ractive, Outer, Inner, inner;

			Inner = Ractive.extend({
				template: '{{input.value}}',
				update: function ( val ) {
					this.set( 'input', { value: val });
				}
			});

			Outer = Ractive.extend({
				template: '{{#inputs}}<inner input="{{this}}"/>{{/inputs}}',
				components: { inner: Inner }
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#simulation}}<outer inputs="{{inputs}}"/>{{/simulation}}',
				components: { outer: Outer },
				data: {
					simulation: { inputs: [{ value: 1 }] }
				}
			});

			t.equal( ractive.get( 'simulation.inputs[0].value' ), 1 );

			inner = ractive.findComponent( 'inner' );

			inner.update( 2 );
			t.equal( ractive.get( 'simulation.inputs[0].value' ), 2 );
			t.htmlEqual( fixture.innerHTML, '2' );

		});

	};

});
