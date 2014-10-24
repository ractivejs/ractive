define([ 'ractive', 'helpers/Model', 'utils/log' ], function ( Ractive, Model, log ) {

	'use strict';

	return function () {

		var fixture;

		module( 'Lightweight Components' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );


		test( 'Components are rendered in the correct place', t => {
			var Component, ractive;

			Component = Ractive.extend({
				template: '<p>this is a component!</p>',
				lightweight: true
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

		test( 'Parent data is accesible from child', t => {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{foo}}</p>',
				lightweight: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				data: {
					foo: 'bar'
				},
				components: {
					widget: Widget
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>bar</p>' );
			widget = ractive.findComponent( 'widget' );
			t.equal( widget.get( 'foo' ), 'bar' );
			widget.set( 'foo' , 'blah' );
			t.htmlEqual( fixture.innerHTML, '<p>blah</p>' );
		});


		test( 'Section context works for child component', t => {
			var Widget, ractive, widget;

			Widget = Ractive.extend({
				template: '<p>{{bar}}</p>',
				lightweight: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}<widget/>{{/}}',
				components: {
					widget: Widget
				},
				data: {
					foo: {
						bar: 'the bar'
					}
				}
			});

			widget = ractive.findComponent( 'widget' );

			t.htmlEqual( fixture.innerHTML, '<p>the bar</p>' );

			ractive.set( 'foo.bar', 'le bar' );
			t.htmlEqual( fixture.innerHTML, '<p>le bar</p>' );

			widget.set( 'foo.bar', 'el barro' );
			t.htmlEqual( fixture.innerHTML, '<p>el barro</p>' );

			ractive.set( 'foo', { bar: 'walk into a'} );
			t.htmlEqual( fixture.innerHTML, '<p>walk into a</p>' );
		});


		// TODO
		test( 'Warns on explicit bindings...', t => {
			// var Widget, ractive, widget;

			// Widget = Ractive.extend({
			// 	template: '<p>{{foo}}</p>'
			// });

			// ractive = new Ractive({
			// 	el: fixture,
			// 	template: '<widget foo="{{missing}}"/>',
			// 	components: {
			// 		widget: Widget
			// 	}
			// });
			t.ok( true );

		});


		test( 'Element order is maintained correctly with components with multiple top-level elements', t => {
			var ractive, TestComponent;

			TestComponent = Ractive.extend({
				template: '{{#bool}}TRUE{{/bool}}{{^bool}}FALSE{{/bool}}',
				lightweight: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>before</p> <test/> <p>after</p>',
				components: { test: TestComponent }
			});

			t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );

			ractive.set( 'bool', true );
			t.htmlEqual( fixture.innerHTML, '<p>before</p> TRUE <p>after</p>' );

			ractive.set( 'bool', false );
			t.htmlEqual( fixture.innerHTML, '<p>before</p> FALSE <p>after</p>' );
		});

		test( 'Regression test for #317', t => {
			var Widget, widget, ractive, items;

			Widget = Ractive.extend({
				template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
				lightweight: true,
				oninit: function () {
					widget = this;
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/><p>{{ items.join( " " ) }}</p>',
				data: { items: [ 'a', 'b', 'c', 'd' ] },
				components: {
					widget: Widget
				}
			});

			items = ractive.get( 'items' );

			t.equal( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li></ul><p>a b c d</p>' );

			items.push( 'e' );
			t.equal( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li><li>4: e</li></ul><p>a b c d e</p>' );

			items.splice( 2, 1 );
			t.equal( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li><li>3: e</li></ul><p>a b d e</p>' );

			items.pop();
			t.equal( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li></ul><p>a b d</p>' );

			ractive.set( 'items[0]', 'f' );
			t.equal( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li></ul><p>f b d</p>' );


			// reset items from within widget
			widget.set( 'items', widget.get( 'items' ).slice() );
			items = ractive.get( 'items' );

			items.push( 'g' );
			t.equal( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li><li>3: g</li></ul><p>f b d g</p>' );

			items.splice( 1, 1 );
			t.equal( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li><li>2: g</li></ul><p>f d g</p>' );

			items.pop();
			t.equal( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li></ul><p>f d</p>' );

			widget.set( 'items[0]', 'h' );
			t.equal( fixture.innerHTML, '<ul><li>0: h</li><li>1: d</li></ul><p>h d</p>' );
		});

		asyncTest( 'Component oncomplete() methods are called', t => {
			var ractive, Widget, counter, done;

			expect( 2 );

			counter = 2;
			done = function () { --counter || start(); };

			Widget = Ractive.extend({
				lightweight: true,
				oncomplete: function () {
					t.ok( true, 'oncomplete in component' );
					done();
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				oncomplete: function () {
					t.ok( true, 'oncomplete in ractive' );
					done();
				},
				components: {
					widget: Widget
				}
			});
		});

		test( 'Nested components can access outer-most data context', t => {
			var ractive, Widget;

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				components: {
					widget: Ractive.extend({
						lightweight: true,
						template: '<grandwidget/>',
						components: {
							lightweight: true,
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

		test( 'Nested components registered at global Ractive can access outer-most data context', t => {
			var ractive, Widget;

			Ractive.components.widget = Ractive.extend({
				template: '<grandwidget/>',
				lightweight: true,
			});

			Ractive.components.grandwidget = Ractive.extend({
				template: 'hello {{world}}',
				lightweight: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				data: { world: 'mars' }
			});

			t.htmlEqual( fixture.innerHTML, 'hello mars' );
			ractive.set('world', 'venus');
			t.htmlEqual( fixture.innerHTML, 'hello venus' );

			delete Ractive.components.widget
			delete Ractive.components.grandwidget
		});

		test( 'Uninitialised implicit dependencies of evaluators that use inherited functions are handled', t => {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '{{status()}}',
				lightweight: true
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

		asyncTest( 'Instances with multiple components still fire oncomplete() handlers (#486 regression)', t => {
			var Widget, ractive, counter, done;

			Widget = Ractive.extend({
				template: 'foo',
				lightweight: true,
				oncomplete: function () {
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
				oncomplete: function () {
					t.ok( true );
					done();
				}
			});
		});

		test( 'findComponent and findAllComponents work through {{>content}}', t => {

			var Wrapper, Component, ractive;

			Component = Ractive.extend({ lightweight: true });
			Wrapper = Ractive.extend({
				template: '<p>{{>content}}</p>',
				lightweight: true,
				components: {
					component: Component
				}
			});

			ractive = new Ractive({
				el: fixture,
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

		test( 'Correct value is given to node._ractive.keypath when a component is torn down and re-rendered (#470)', t => {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '{{#foo}}<widget/>{{/foo}}',
				data: { foo: {}, visible: true },
				components: {
					widget: Ractive.extend({
						template: '{{#visible}}<p>{{test}}</p>{{/visible}}',
						lightweight: true
					})
				}
			});

			t.equal( ractive.find( 'p' )._ractive.keypath, 'foo' );

			ractive.set( 'visible', false );
			ractive.set( 'visible', true );

			t.equal( ractive.find( 'p' )._ractive.keypath, 'foo' );
		});

		test( 'Nested components fire the oninit() event correctly (#511)', t => {
			var ractive, Outer, Inner, outerInitCount = 0, innerInitCount = 0;

			Inner = Ractive.extend({
				lightweight: true,
				oninit: function () {
					innerInitCount += 1;
				}
			});

			Outer = Ractive.extend({
				template: '<inner/>',
				lightweight: true,
				oninit: function () {
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
			t.equal( outerInitCount, 1, '<outer/> component should call oninit()' );
			t.equal( innerInitCount, 1, '<inner/> component should call oninit()' );
		});

		test( 'foo.bar should stay in sync between <one foo="{{foo}}"/> and <two foo="{{foo}}"/>', t => {
			var ractive, Component;

			Component = Ractive.extend({
				template: '<p>{{foo.bar}}</p>',
				lightweight: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<one/><two/>',
				components: {
					one: Component.extend(),
					two: Component.extend()
				}
			});

			ractive.set( 'foo', {} );
			t.htmlEqual( fixture.innerHTML, '<p></p><p></p>' );

			ractive.findComponent( 'one' ).set( 'foo.bar', 'baz' );
			t.htmlEqual( fixture.innerHTML, '<p>baz</p><p>baz</p>' );

			ractive.findComponent( 'two' ).set( 'foo.bar', 'qux' );
			t.htmlEqual( fixture.innerHTML, '<p>qux</p><p>qux</p>' );
		});


		test( 'foo.bar should stay in sync between lightweight <one foo="{{foo}}"/> and non-lightweight <two foo="{{foo}}"/>', t => {
			var ractive, Component;

			Component = Ractive.extend({
				template: '<p>{{foo.bar}}</p>'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<one/><two foo="{{foo}}"/>',
				components: {
					one: Component.extend({ lightweight: true }),
					two: Component.extend()
				}
			});

			ractive.set( 'foo', {} );
			t.htmlEqual( fixture.innerHTML, '<p></p><p></p>' );

			ractive.findComponent( 'one' ).set( 'foo.bar', 'baz' );
			t.htmlEqual( fixture.innerHTML, '<p>baz</p><p>baz</p>' );

			ractive.findComponent( 'two' ).set( 'foo.bar', 'qux' );
			t.htmlEqual( fixture.innerHTML, '<p>qux</p><p>qux</p>' );
		});

		// TODO: make this pass
		// test( 'Index references propagate down to lightweight components', t => {
			// var ractive = new Ractive({
			// 	el: fixture,
			// 	template: '{{#items:i}}<widget/>{{/items}}',
			// 	data: { items: [ 'a', 'b', 'c' ] },
			// 	components: {
			// 		widget: Ractive.extend({
			// 			lightweight: true,
			// 			template: '<p>{{i}}: {{.}}</p>'
			// 		})
			// 	}
			// });

			// t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: b</p><p>2: c</p>' );

			// ractive.get( 'items' ).splice( 1, 1 );
			// t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: c</p>' );
		// });

		// TODO: investigate whether this should pass...
		// test( 'Component removed from DOM on tear-down with teardown override that calls _super', t => {

		// 	var Widget = Ractive.extend({
		// 			template: 'foo',
		// 			lightweight: true,
		// 			teardown: function(){
		// 				this._super();
		// 			}
		// 		});
		// 	var ractive = new Ractive({
		// 			el: fixture,
		// 			template: '{{#item}}<widget/>{{/item}}',
		// 			data: { item: {} },
		// 			components: {
		// 				widget: Widget
		// 			}
		// 		});

		// 	t.htmlEqual( fixture.innerHTML, 'foo' );

		// 	ractive.set( 'item' );
		// 	t.htmlEqual( fixture.innerHTML, '' );
		// });

		//TODO: mixed type tests
		// test( 'Data will propagate up through multiple component boundaries (#520)', t => {
		// 	var ractive, Outer, Inner, inner;

		// 	Inner = Ractive.extend({
		// 		template: '{{input.value}}',
		// 		update: function ( val ) {
		// 			this.set( 'input', { value: val });
		// 		}
		// 	});

		// 	Outer = Ractive.extend({
		// 		template: '{{#inputs}}<inner input="{{this}}"/>{{/inputs}}',
		// 		components: { inner: Inner }
		// 	});

		// 	ractive = new Ractive({
		// 		el: fixture,
		// 		template: '{{#simulation}}<outer inputs="{{inputs}}"/>{{/simulation}}',
		// 		components: { outer: Outer },
		// 		data: {
		// 			simulation: { inputs: [{ value: 1 }] }
		// 		}
		// 	});

		// 	t.equal( ractive.get( 'simulation.inputs[0].value' ), 1 );

		// 	inner = ractive.findComponent( 'inner' );

		// 	inner.update( 2 );
		// 	t.equal( ractive.get( 'simulation.inputs[0].value' ), 2 );
		// 	t.htmlEqual( fixture.innerHTML, '2' );

		// });

		test( 'Set operations inside an inline component\'s onrender method update the DOM synchronously', t => {
			var ListWidget, ractive, previousHeight = -1;

			ListWidget = Ractive.extend({
				template: '<ul>{{#visibleItems}}<li>{{this}}</li>{{/visibleItems}}</ul>',
				lightweight: true,
				onrender: function () {
					var ul, lis, items, height, i;

					ul = this.find( 'ul' );
					lis = this.findAll( 'li', { live: true });

					items = this.get( 'items' );

					for ( i = 0; i < items.length; i += 1 ) {
						this.set( 'visibleItems', items.slice( 0, i ) );

						t.equal( lis.length, i );

						height = ul.offsetHeight;
						t.ok( height > previousHeight );
						previousHeight = height;
					}
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<list-widget/>',
				data: { items: [ 'a', 'b', 'c', 'd' ]},
				components: { 'list-widget': ListWidget }
			});
		});

		// TODO: these don't pass

		// test( 'Evaluator in against in component more than once (gh-844)', t => {
		// 	var Component, BarComponent, ractive;


		// 	Component = Ractive.extend({
		// 		template: '{{getLabels(foo)}}{{getLabels(boo)}}',
		// 		lightweight: true,
		// 		data: {
		// 			getLabels: function (x) { return x; },
		// 			foo: 'foo',
		// 			boo: 'boo'
		// 		}
		// 	});

		// 	var r = new Ractive({
		// 		el: fixture,
		// 		components: { c: Component },
		// 		template: '<c>'
		// 	});

		// 	t.equal( fixture.innerHTML, 'fooboo' );
		// });

		// test( 'Removing inline components causes teardown events to fire (#853)', t => {
		// 	var ractive = new Ractive({
		// 		el: fixture,
		// 		template: '{{#if foo}}<widget/>{{/if}}',
		// 		data: {
		// 			foo: true
		// 		},
		// 		components: {
		// 			widget: Ractive.extend({
		// 				template: 'widget',
		// 				lightweight: true,
		// 				oninit: function () {
		// 					this.on( 'teardown', function () {
		// 						t.ok( true );
		// 					})
		// 				}
		// 			})
		// 		}
		// 	});

		// 	expect( 1 );
		// 	ractive.toggle( 'foo' );
		// });

		test( 'Implicit bindings involving context (#975)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#context}}<widget/>{{/}}',
				components: {
					widget: Ractive.extend({
						lightweight: true,
						template: 'works? {{works}}'
					})
				},
				data: {
					context: {
						works: 'yes'
					}
				}
			});

			t.htmlEqual( fixture.innerHTML, 'works? yes' );
		});

		// TODO: this should pass
		// test( 'Data that does not exist in a parent context binds to the current instance on set (#1205)', function ( t ) {
		// 	var ractive = new Ractive({
		// 		el: fixture,
		// 		template: '<widget/><widget/>',
		// 		components: {
		// 			widget: Ractive.extend({
		// 				lightweight: true,
		// 				template: '<p>title:{{title}}</p>'
		// 			})
		// 		}
		// 	});

		// 	ractive.findComponent( 'widget' ).set( 'title', 'foo' );

		// 	t.htmlEqual( fixture.innerHTML, '<p>title:foo</p><p>title:</p>' );
		// });


		test( 'Inter-component bindings can be created via this.get() and this.observe(), not just through templates', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '<p>message: {{proxy}}</p>',
				lightweight: true,
				oninit: function () {
					this.observe( 'message', function ( message ) {
						this.set( 'proxy', message );
					});

					t.equal( this.get( 'answer' ), 42 );
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				data: {
					message: 'hello',
					answer: 42
				},
				components: {
					widget: Widget
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>message: hello</p>' );
			ractive.set( 'message', 'goodbye' );
			t.htmlEqual( fixture.innerHTML, '<p>message: goodbye</p>' );
		});

		test( 'Component CSS is added to the page before components (#1046)', function ( t ) {
			var Box, ractive;

			Box = Ractive.extend({
				lightweight: true,
				template: '<div class="box"></div>',
				css: '.box { width: 100px; height: 100px; }',
				onrender: function () {
					var div = this.find( '.box' );
					t.equal( div.offsetHeight, 100 );
					t.equal( div.offsetWidth, 100 );
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#if showBox}}<box/>{{/if}}',
				components: { box: Box }
			});

			ractive.set( 'showBox', true );
		});

		//TODO make this work with computed's
		// test( 'Sibling components do not unnessarily update on refinement update of data. (#1293)', function ( t ) {
		// 	var ractive, Widget1, Widget2, noCall = false, warn = console.warn;

		// 	expect( 3 );

		// 	console.warn = function (err) { throw err };

		// 	try {
		// 		Widget1 = Ractive.extend({
		// 			debug: true,
		// 			lightweight: true,
		// 			template: 'w1:{{tata.foo}}{{tata.bar}}'
		// 		});

		// 		Widget2 = Ractive.extend({
		// 			debug: true,
		// 			lightweight: true,
		// 			template: 'w2:{{data.foo}}{{calc}}',
		// 			computed: {
		// 				calc: function () {
		// 					if( noCall ) { throw new Error('"calc" should not be recalculated!')}
		// 					return this.get('schmata.bar')
		// 				}
		// 			},
		// 			oninit: function () {
		// 				this.observe('data.bar', function (n,o,k) {
		// 					throw new Error('observe on schmata.bar should not fire')
		// 				}, { init: false } )
		// 			}
		// 		});

		// 		ractive = new Ractive({
		// 			el: fixture,
		// 			template: '{{data.foo}}{{data.bar}}<widget1/><widget2/>',
		// 			data: {
		// 				data: {
		// 					foo: 'foo',
		// 					bar: 'bar'
		// 				}
		// 			},
		// 			components: {
		// 				widget1: Widget1,
		// 				widget2: Widget2
		// 			},
		// 			oninit: function () {
		// 				this.observe('data.bar', function (n,o,k) {
		// 					throw new Error('observe on data.bar should not fire')
		// 				}, { init: false } )
		// 			}
		// 		});

		// 		t.htmlEqual( fixture.innerHTML, 'foobarw1:foobarw2:foobar' );
		// 		noCall = true;
		// 		ractive.findComponent('widget1').set( 'tata.foo', 'update' );
		// 		t.htmlEqual( fixture.innerHTML, 'updatebarw1:updatebarw2:updatebar' );

		// 		t.ok( true );

		// 	} catch(err){
		// 		t.ok( false, err );
		// 	} finally {
		// 		console.warn = warn;
		// 	}

		// });

		test( 'Component bindings respect smart updates (#1209)', function ( t ) {
			var Widget, ractive, intros = {}, outros = {};

			Widget = Ractive.extend({
				template: '{{#each items}}<p intro-outro="log">{{this}}</p>{{/each}}',
				transitions: {
					log: function ( t ) {
						var x = t.node.innerHTML, count = t.isIntro ? intros : outros;

						if ( !count[x] ) count[x] = 0;
						count[x] += 1;

						t.complete();
					}
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<widget/>',
				components: { widget: Widget },
				data: { items: [ 'a', 'b', 'c' ]}
			});

			t.deepEqual( intros, { a: 1, b: 1, c: 1 });

			ractive.merge( 'items', [ 'a', 'c' ]);
			t.deepEqual( outros, { b: 1 });

			ractive.shift( 'items' );
			t.deepEqual( outros, { a: 1, b: 1 });
		});

		test( 'Decorators and transitions are only initialised post-render, when components are inside elements (#1346)', function ( t ) {
			var ractive, inDom = {};

			ractive = new Ractive({
				el: fixture,
				template: '<div decorator="check:div"><widget><p decorator="check:p"></p></div>',
				components: {
					widget: Ractive.extend({
						lightweight: true,
						template: '<div decorator="check:widget">{{yield}}</div>'
					})
				},
				decorators: {
					check: function ( node, id ) {
						inDom[ id ] = fixture.contains( node );
						return { teardown: function () {} };
					}
				}
			});

			t.deepEqual( inDom, { div: true, widget: true, p: true });
		});

		return;

	};

});
