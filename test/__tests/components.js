import hasUsableConsole from 'hasUsableConsole';
import cleanup from 'helpers/cleanup';

QUnit.module( 'Components', { afterEach: cleanup });


test( 'Components are rendered in the correct place', t => {
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

test( 'Top-level sections in components are updated correctly', t => {
	var ractive, Component;

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

test( 'Element order is maintained correctly with components with multiple top-level elements', t => {
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


asyncTest( 'Component oncomplete() methods are called', t => {
	var ractive, Widget, counter, done;

	expect( 2 );

	counter = 2;
	done = function () { if ( !--counter) start(); };

	Widget = Ractive.extend({
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

test( 'Top-level list sections in components do not cause elements to be out of order (#412 regression)', t => {
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


asyncTest( 'Instances with multiple components still fire oncomplete() handlers (#486 regression)', t => {
	var Widget, ractive, counter, done;

	Widget = Ractive.extend({
		template: 'foo',
		oncomplete: function () {
			t.ok( true );
			done();
		}
	});

	expect( 3 );

	counter = 3;
	done = function () { if ( !--counter ) start(); };

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

	Component = Ractive.extend({});
	Wrapper = Ractive.extend({
		template: '<p>{{>content}}</p>',
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

test( 'Nested components fire the oninit() event correctly (#511)', t => {
	var ractive, Outer, Inner, outerInitCount = 0, innerInitCount = 0;

	Inner = Ractive.extend({
		oninit: function () {
			innerInitCount += 1;
		}
	});

	Outer = Ractive.extend({
		template: '<inner/>',
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


test( 'Component removed from DOM on tear-down with teardown override that calls _super', t => {
	const Widget = Ractive.extend({
		template: 'foo',
		teardown () {
			this._super();
		}
	});

	const ractive = new Ractive({
		el: fixture,
		template: '{{#if item}}<Widget/>{{/if}}',
		data: { item: true },
		components: { Widget }
	});

	t.htmlEqual( fixture.innerHTML, 'foo' );

	ractive.set( 'item' );
	t.htmlEqual( fixture.innerHTML, '' );
});

test( 'Component names cannot include underscores (#483)', t => {
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

test( 'Components can have names that happen to be Array.prototype or Object.prototype methods', t => {
	var Map, ractive;

	Map = Ractive.extend({
		template: '<div class="map"></div>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<map/>',
		components: {
			map: Map
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div class="map"></div>' );
});

test( 'Set operations inside an inline component\'s onrender method update the DOM synchronously', t => {
	var ListWidget, ractive, previousHeight = -1;

	ListWidget = Ractive.extend({
		template: '<ul>{{#visibleItems}}<li>{{this}}</li>{{/visibleItems}}</ul>',
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
		template: '<list-widget items="{{items}}"/>',
		data: { items: [ 'a', 'b', 'c', 'd' ]},
		components: { 'list-widget': ListWidget }
	});
});


test( 'Components found in view hierarchy', t => {
	var FooComponent, BarComponent, ractive;

	FooComponent = Ractive.extend({
		template: 'foo'
	});

	BarComponent = Ractive.extend({
		template: '<foo/>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<bar/>',
		components: {
			foo: FooComponent,
			bar: BarComponent
		}
	});

	t.equal( fixture.innerHTML, 'foo' );
});

test( 'Components not found in view hierarchy when isolated is true', t => {
	var FooComponent, BarComponent, ractive;

	FooComponent = Ractive.extend({
		template: 'foo'
	});

	BarComponent = Ractive.extend({
		template: '<foo/>',
		isolated: true
	});

	ractive = new Ractive({
		el: fixture,
		template: '<bar/>',
		components: {
			foo: FooComponent,
			bar: BarComponent
		}
	});

	t.equal( fixture.innerHTML, '<foo></foo>' );
});

test( 'Evaluator used in component more than once (gh-844)', t => {
	var Component;


	Component = Ractive.extend({
		template: '{{getLabels(foo)}}{{getLabels(boo)}}',
		data: {
			getLabels: function (x) { return x; },
			foo: 'foo',
			boo: 'boo'
		}
	});

	new Ractive({
		el: fixture,
		components: { c: Component },
		template: '<c>'
	});

	t.equal( fixture.innerHTML, 'fooboo' );
});

test( 'Removing inline components causes teardown events to fire (#853)', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#if foo}}<widget/>{{/if}}',
		data: {
			foo: true
		},
		components: {
			widget: Ractive.extend({
				template: 'widget',
				oninit: function () {
					this.on( 'teardown', function () {
						t.ok( true );
					});
				}
			})
		}
	});

	expect( 1 );
	ractive.toggle( 'foo' );
});

test( 'Regression test for #871', t => {
	const Widget = Ractive.extend({
		template: '<p>inside component: {{i}}-{{text}}</p>'
	});

	const ractive = new Ractive({
		el: fixture,
		template: `
			{{#items:i}}
				<p>outside component: {{i}}-{{uppercase(.)}}</p>
				<Widget text="{{uppercase(.)}}" />
			{{/items}}`,
		data: {
			items: [ 'a', 'b', 'c' ],
			uppercase ( letter ) {
				return letter.toUpperCase();
			}
		},
		components: { Widget }
	});

	ractive.splice( 'items', 1, 1 );

	t.htmlEqual( fixture.innerHTML, '<p>outside component: 0-A</p><p>inside component: 0-A</p><p>outside component: 1-C</p><p>inside component: 1-C</p>' );
});

test( 'Specify component by function', t => {
	var Widget1, Widget2, ractive;

	Widget1 = Ractive.extend({ template: 'widget1' });
	Widget2 = Ractive.extend({ template: 'widget2' });

	ractive = new Ractive({
		el: fixture,
		template: '{{#items}}<widget/>{{/items}}',
		components: {
			widget () {
				return this.get( 'foo' ) ? Widget1 : Widget2;
			}
		},
		data: {
			foo: true,
			items: [1]
		}
	});

	t.htmlEqual( fixture.innerHTML, 'widget1' );
	ractive.set( 'foo', false );
	ractive.push( 'items', 2);
	t.htmlEqual( fixture.innerHTML, 'widget1widget1', 'Component pinned until reset' );

	ractive.reset( ractive.get() );
	t.htmlEqual( fixture.innerHTML, 'widget2widget2' );
});

test( 'Specify component by function as string', t => {
	var Widget, ractive;

	Widget = Ractive.extend({ template: 'foo' });

	ractive = new Ractive({
		el: fixture,
		template: '<widget/>',
		components: {
			widget: function() {
				return 'widget1';
			},
			widget1: Widget
		}
	});

	t.htmlEqual( fixture.innerHTML, 'foo' );
});

if ( hasUsableConsole ) {
	test( 'no return of component warns in debug', t => {
		var ractive, warn = console.warn;

		expect( 1 );

		console.warn = function( msg ) {
			t.ok( msg );
		};

		ractive = new Ractive({
			el: fixture,
			template: '<widget/>',
			debug: true,
			components: {
				widget: function() {
					// where's my component?
				}
			}
		});

		console.warn = warn;
	});

	test( 'Inline components disregard `el` option (#1072) (and print a warning in debug mode)', function ( t ) {
		var warn = console.warn;

		expect( 1 );

		console.warn = function () {
			t.ok( true );
		};

		var ractive = new Ractive({
			el: fixture,
			data: { show: true },
			template: '{{#if show}}<widget/>{{/if}}',
			components: {
				widget: Ractive.extend({
					el: fixture,
					template: '{{whatever}}'
				})
			},
			debug: true
		});

		ractive.set( 'show', false );
		console.warn = warn;
	});

	test( 'Using non-primitives in data passed to Ractive.extend() triggers a warning', t => {
		let warn = console.warn;
		console.warn = msg => {
			t.ok( /Passing a `data` option with object and array properties to Ractive.extend\(\) is discouraged, as mutating them is likely to cause bugs/.test( msg ) );
		};

		expect( 1 );

		Ractive.extend({
			data: {
				foo: 42
			}
		});

		Ractive.extend({
			data: {
				foo: {}
			}
		});

		Ractive.extend({
			data: () => ({
				foo: {}
			})
		});

		console.warn = warn;
	});
}

test( '`this` in function refers to ractive instance', t => {

	var thisForFoo, thisForBar, ractive, Component;

	Component = Ractive.extend({});

	ractive = new Ractive({
		el: fixture,
		template: '<foo/><widget/>',
		data: { foo: true },
		components: {
			widget: Ractive.extend({
				template: '<bar/>'
			}),
			foo: function ( ) {
				thisForFoo = this;
				return Component;
			},
			bar: function ( ) {
				thisForBar = this;
				return Component;
			}
		}
	});

	t.equal( thisForFoo, ractive );
	t.equal( thisForBar, ractive );

});

asyncTest( 'oninit() only fires once on a component (#943 #927), oncomplete fires each render', t => {
	expect( 5 );

	let inited = false;
	let completed = 0;
	let rendered = 0;

	const Component = Ractive.extend({
		oninit () {
			t.ok( !inited, 'oninit should not be called second time' );
			inited = true;
		},
		onrender () {
			rendered++;
			t.ok( true );
		},
		oncomplete () {
			completed++;
			t.ok( true );

			if( rendered === 2 && completed === 2 ) {
				start();
			}
		}
	});

	const component = new Component({
		el: fixture,
		template () {
			return this.get( 'foo' ) ? 'foo' : 'bar';
		}
	});

	component.reset({ foo: true });
});

test( 'Double teardown is handled gracefully (#1218)', function () {
	var Widget, ractive;

	expect( 0 );

	Widget = Ractive.extend({
		template: '<p>foo: {{foo}}</p>'
	});

	ractive = new Ractive({
		el: fixture,
		template: `
			{{#visible}}
				<widget autoclose='1000' on-teardown='hideChild' />
			{{/visible}}`,
		data: {
			visible: true
		},
		components: { widget: Widget }
	});

	ractive.on( 'hideChild', () => ractive.set( 'visible', false ) );
	ractive.findComponent( 'widget' ).teardown();
});

test( 'component.teardown() causes component to be removed from the DOM (#1223)', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '<p>I am here!</p>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget/>',
		components: { widget: Widget }
	});

	ractive.findComponent( 'widget' ).teardown();
	t.htmlEqual( fixture.innerHTML, '' );
});

test( 'Component CSS is added to the page before components (#1046)', function ( t ) {
	var Box, ractive;

	Box = Ractive.extend({
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

test( 'Decorators and transitions are only initialised post-render, when components are inside elements (#1346)', function ( t ) {
	var ractive, inDom = {};

	const Widget = Ractive.extend({
		template: '<div decorator="check:widget">{{yield}}</div>'
	});

	new Ractive({
		el: fixture,
		template: '<div decorator="check:div"><Widget><p decorator="check:p"></p></div>',
		components: { Widget },
		decorators: {
			check ( node, id ) {
				inDom[ id ] = fixture.contains( node );
				return { teardown () {} };
			}
		}
	});

	t.deepEqual( inDom, { div: true, widget: true, p: true });
});

test( 'Data is synced as soon as an unresolved mapping is resolved', function ( t ) {
	var ractive;

	ractive = new Ractive({
		el: fixture,
		template: '<outer/>',
		data: {
			item: {}
		},
		components: {
			outer: Ractive.extend({
				template: '{{#with item}}<inner foo="{{foo}}"/>{{/with}}'
			}),
			inner: Ractive.extend({
				template: '<p>foo: {{foo}}</p>'
			})
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>foo: </p>' );

	ractive.toggle( 'item.foo' );
	t.htmlEqual( fixture.innerHTML, '<p>foo: true</p>' );

	ractive.toggle( 'item.foo' );
	t.htmlEqual( fixture.innerHTML, '<p>foo: false</p>' );
});

// TODO: revist how we should handle this before finishing keypath-ftw
/*
test( 'Mapping to a computed property is an error', function ( t ) {
	t.throws( function () {
		var ractive = new Ractive({
			template: '<widget foo="{{bar}}"/>',
			data: { bar: 'irrelevant' },
			components: {
				widget: Ractive.extend({
					computed: {
						foo: function () {
							return 42;
						}
					}
				})
			}
		});
		// console.log(ractive.get('bar'));
	}, /Computed property 'foo' cannot shadow a mapped property/ );
});
*/
// TODO: fix this, failing since keypath-ftw. maybe revisit if this is really correct
/*
test( 'Implicit mappings are created by restricted references (#1465)', function ( t ) {
	new Ractive({
		el: fixture,
		template: '<p>a: {{foo}}</p><b/><c/>',
		data: {
			foo: 'bar'
		},
		components: {
			b: Ractive.extend({
				template: '<p>b: {{./foo}}</p>',
				oninit: function () {
					this.get( 'foo' ); // triggers mapping creation; should be unnecessary
				}
			}),
			c: Ractive.extend({
				template: '<p>c: {{./foo}}</p>'
			})
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>a: bar</p><p>b: bar</p><p>c: bar</p>' );
});
*/

test( 'Multiple components two-way binding', function ( t ) {
	const ListFoo = Ractive.extend({
		template: `{{d.foo}}`
	});

	const ListBaz = Ractive.extend({
		template: `
			{{#each list}}
				{{a}}
			{{/each}}
		`
	});

	const ListBar = Ractive.extend({
		template: `
			<ListBaz list="{{d.bar}}" />
		`,
		components: { ListBaz }
	});

	let list = []

	const ractive = new Ractive({
		el: fixture,
		template: `
		{{#each list}}
			{{#if bar}}
			<ListBar d='{{.}}'/>
			{{else}}
			<ListFoo d='{{.}}'/>
			{{/if bar}}
		{{/each list}}
		`,
		components: { ListFoo, ListBar },
		data: { list: list }
	});

	let list2 = [
		{ foo: 1 },
		{ foo: 2, bar: [ { a: 1 }, { a: 2 }, { a: 3 } ] },
		{ foo: 3 },
	]

	for (var i = 0; i < list2.length; i++) {
		list.push(list2[i])
	}

	t.htmlEqual( fixture.innerHTML, '11233' );
});

test( 'Explicit mappings with uninitialised data', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<foo/>',
		components: {
			foo: Ractive.extend({ template: '<bar message="{{message}}"/>' }),
			bar: Ractive.extend({ template: '<baz message="{{message}}"/>' }),
			baz: Ractive.extend({ template: '{{message}}' })
		}
	});

	ractive.set( 'message', 'hello' );
	t.htmlEqual( fixture.innerHTML, 'hello' );
});

test( 'Implicit mappings with uninitialised data', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<foo message="{{message}}"/>',
		components: {
			foo: Ractive.extend({ template: '<bar/>' }),
			bar: Ractive.extend({ template: '<baz/>' }),
			baz: Ractive.extend({ template: '{{message}}' })
		}
	});

	ractive.set( 'message', 'hello' );
	t.htmlEqual( fixture.innerHTML, 'hello' );
});

test( 'Two-way bindings on an unresolved key can force resolution', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#context}}<foo value="{{value}}" />{{/}}',
		components: {
			foo: Ractive.extend({ template: '<input value="{{value}}" />' })
		},
		data: { context: {} }
	});

	ractive.set( 'context.value', 'hello' );

	t.equal( ractive.find( 'input' ).value, 'hello' );
});

test( 'Component mappings used in computations resolve correctly with the mapping (#1645)', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '<c1/>',
		components: {
			c1: Ractive.extend({ template: '<c2 foo="{{bar}}" />' }),
			c2: Ractive.extend({ template: '{{JSON.stringify(foo)}}' })
		},
		onrender: function() {
			this.set( 'bar', {} );
		}
	});

	t.htmlEqual( fixture.innerHTML, ractive.toHTML() );
});

test( 'Component attributes with no = are boolean true', t => {
	new Ractive({
		el: fixture,
		template: '<cmp foo />',
		components: { cmp: Ractive.extend({ template: '{{#foo === true}}yep{{/}}' }) }
	});

	t.htmlEqual( fixture.innerHTML, 'yep' );
});

test( 'Component attributes with an empty string come back with an empty string', t => {
	new Ractive({
		el: fixture,
		template: `<cmp foo='' />`,
		components: { cmp: Ractive.extend({ template: `{{#foo === ''}}yep{{/}}` }) }
	});

	t.htmlEqual( fixture.innerHTML, 'yep' );
});

test( 'Unresolved keypath can be safely torn down', t => {
	expect(0);

	var ractive = new Ractive({
		el: fixture,
		template: `<outer/>`,
		components: {
			outer: Ractive.extend({ template: `{{#show}}<inner foo="{{unresolved}}"/>{{/}}` }),
			inner: Ractive.extend({ template: `{{foo}}` })
		},
		data: {
			show: true
		}
	});

	ractive.set('show', false);
});

test( 'Mappings resolve correctly where references are shadowed (#2108)', assert => {
	const names = [ 'alice', 'amy', 'andrew', 'bob', 'beatrice', 'brenda', 'charles', 'colin', 'camilla' ];

	const Group = Ractive.extend({
		template: `{{names.length}}`
	});

	const List = Ractive.extend({
		template: `
			{{#each groups}}
				<Group names='{{names}}'/>
			{{/each}}`,
		data: () => ({
			groups: [ 'a', 'b', 'c' ].map( letter => {
				return { names: names.filter( name => name[0] === letter ) };
			})
		}),
		components: { Group }
	});

	const ractive = new Ractive({
		el: fixture,
		template: `<List names='{{names}}'/>`,
		data: { names },
		components: { List }
	});

	assert.equal( fixture.innerHTML, '333' );
});


test( 'not null value for this.parent in Component.oncunstruct() (#2091)', t => {
	var component = Ractive.extend({
		template: "<div>component</div>",
		onconstruct: function()
		{
			var parent = this.parent !== null;
			t.equal(parent,true);
		}
	});
	var ractive = new Ractive({
		el: fixture,
		template: 'Here comes the <c1>',
		components: {
			c1: component
		}
	});
});
