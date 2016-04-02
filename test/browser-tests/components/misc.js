import { test } from 'qunit';
import { hasUsableConsole, onWarn } from 'test-config';

// TODO tidy up, move some of these tests into separate files

test( 'Component oncomplete() methods are called', t => {
	t.expect( 2 );

	const done = t.async();

	let counter = 2;
	const check = () => {
		if ( !--counter) done();
	};

	const Widget = Ractive.extend({
		oncomplete () {
			t.ok( true, 'oncomplete in component' );
			check();
		}
	});

	new Ractive({
		el: fixture,
		template: '<Widget/>',
		oncomplete () {
			t.ok( true, 'oncomplete in ractive' );
			check();
		},
		components: { Widget }
	});
});

test( 'Instances with multiple components still fire oncomplete() handlers (#486 regression)', t => {
	t.expect( 3 );

	const done = t.async();

	let counter = 3;
	const check = () => {
		if ( !--counter) done();
	};

	const Widget = Ractive.extend({
		template: 'foo',
		oncomplete () {
			t.ok( true );
			check();
		}
	});

	new Ractive({
		el: fixture,
		template: '<Widget/><Widget/>',
		components: { Widget },
		oncomplete () {
			t.ok( true );
			check();
		}
	});
});

test( 'Correct value exists for node info keypath when a component is torn down and re-rendered (#470)', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '{{#foo}}<Widget visible="{{visible}}"/>{{/foo}}',
		data: { foo: {}, visible: true },
		components: {
			Widget: Ractive.extend({
				template: '{{#visible}}<p>{{test}}</p>{{/visible}}'
			})
		}
	});

	t.equal( Ractive.getNodeInfo( ractive.find( 'p' ) ).keypath, '' );

	ractive.set( 'visible', false );
	ractive.set( 'visible', true );

	t.equal( Ractive.getNodeInfo( ractive.find( 'p' ) ).keypath, '' );
});

test( 'Nested components fire the oninit() event correctly (#511)', t => {
	let outerInitCount = 0;
	let innerInitCount = 0;

	const Inner = Ractive.extend({
		oninit () {
			innerInitCount += 1;
		}
	});

	const Outer = Ractive.extend({
		template: '<Inner/>',
		oninit () {
			outerInitCount += 1;
		},
		components: { Inner }
	});

	const ractive = new Ractive({
		el: fixture,
		template: '{{#foo}}<Outer/>{{/foo}}',
		data: { foo: false },
		components: { Outer }
	});

	ractive.set( 'foo', true );

	// initCounts should have incremented synchronously
	t.equal( outerInitCount, 1, '<Outer/> component should call oninit()' );
	t.equal( innerInitCount, 1, '<Inner/> component should call oninit()' );
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
	t.expect( 1 );

	const Component = Ractive.extend({ template: '{{foo}}' });

	try {
		new Ractive({
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
	new Ractive({
		el: fixture,
		template: '<map/>',
		components: {
			map: Ractive.extend({
				template: '<div class="map"></div>'
			})
		}
	});

	t.htmlEqual( fixture.innerHTML, '<div class="map"></div>' );
});

test( 'Set operations inside an inline component\'s onrender method update the DOM synchronously', t => {
	t.expect( 8 );

	let previousHeight = -1;

	const List = Ractive.extend({
		template: '<ul>{{#visibleItems}}<li>{{this}}</li>{{/visibleItems}}</ul>',
		onrender () {
			const ul = this.find( 'ul' );
			const lis = this.findAll( 'li', { live: true });

			const items = this.get( 'items' );

			for ( let i = 0; i < items.length; i += 1 ) {
				this.set( 'visibleItems', items.slice( 0, i ) );

				t.equal( lis.length, i );

				const height = ul.offsetHeight;
				t.ok( height > previousHeight );
				previousHeight = height;
			}
		}
	});

	new Ractive({
		el: fixture,
		template: '<List items="{{items}}"/>',
		data: { items: [ 'a', 'b', 'c', 'd' ]},
		components: { List }
	});
});

test( 'Component constructors found in view hierarchy', t => {
	const Foo = Ractive.extend({
		template: 'foo'
	});

	const Bar = Ractive.extend({
		template: '<Foo/>'
	});

	new Ractive({
		el: fixture,
		template: '<Bar/>',
		components: { Foo, Bar }
	});

	t.equal( fixture.innerHTML, 'foo' );
});

test( 'Components not found in view hierarchy when isolated is true', t => {
	const Foo = Ractive.extend({
		template: 'foo'
	});

	const Bar = Ractive.extend({
		template: '<Foo/>',
		isolated: true
	});

	new Ractive({
		el: fixture,
		template: '<Bar/>',
		components: { Foo, Bar }
	});

	t.equal( fixture.innerHTML, '<foo></foo>' );
});

test( 'Evaluator used in component more than once (#844)', t => {
	const Widget = Ractive.extend({
		template: '{{getLabels(foo)}}{{getLabels(boo)}}',
		data: {
			getLabels: x => x,
			foo: 'foo',
			boo: 'boo'
		}
	});

	new Ractive({
		el: fixture,
		components: { Widget },
		template: '<Widget/>'
	});

	t.equal( fixture.innerHTML, 'fooboo' );
});

test( 'Removing inline components causes teardown events to fire (#853)', t => {
	t.expect( 1 );

	const ractive = new Ractive({
		el: fixture,
		template: '{{#if foo}}<Widget/>{{/if}}',
		data: {
			foo: true
		},
		components: {
			Widget: Ractive.extend({
				template: 'widget',
				oninit () {
					this.on( 'teardown', () => {
						t.ok( true );
					});
				}
			})
		}
	});

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
	const Widget1 = Ractive.extend({ template: 'widget1' });
	const Widget2 = Ractive.extend({ template: 'widget2' });

	const ractive = new Ractive({
		el: fixture,
		template: '{{#items}}<Widget/>{{/items}}',
		components: {
			Widget () {
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
	const Widget = Ractive.extend({ template: 'foo' });

	new Ractive({
		el: fixture,
		template: '<Widget/>',
		components: {
			Widget () {
				return 'Widget1';
			},
			Widget1: Widget
		}
	});

	t.htmlEqual( fixture.innerHTML, 'foo' );
});

if ( hasUsableConsole ) {
	test( 'no return of component warns in debug', t => {
		t.expect( 1 );

		onWarn( msg => {
			t.ok( msg );
		});

		new Ractive({
			el: fixture,
			template: '<widget/>',
			components: {
				widget () {
					// where's my component?
				}
			}
		});
	});

	test( 'Inline components disregard `el` option (#1072) (and print a warning in debug mode)', t => {
		t.expect( 1 );

		onWarn( () => {
			t.ok( true );
		});

		const ractive = new Ractive({
			el: fixture,
			data: { show: true },
			template: '{{#if show}}<Widget/>{{/if}}',
			components: {
				Widget: Ractive.extend({
					el: fixture,
					template: '{{whatever}}'
				})
			},
			debug: true
		});

		ractive.set( 'show', false );
	});

	test( 'Using non-primitives in data passed to Ractive.extend() triggers a warning', t => {
		t.expect( 1 );

		onWarn( msg => {
			t.ok( /Passing a `data` option with object and array properties to Ractive.extend\(\) is discouraged, as mutating them is likely to cause bugs/.test( msg ) );
		});

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
	});
}

test( '`this` in function refers to ractive instance', t => {
	const Component = Ractive.extend({});

	let thisForFoo;
	let thisForBar;

	const ractive = new Ractive({
		el: fixture,
		template: '<Foo/><Widget/>',
		data: { foo: true },
		components: {
			Widget: Ractive.extend({
				template: '<Bar/>'
			}),
			Foo () {
				thisForFoo = this;
				return Component;
			},
			Bar () {
				thisForBar = this;
				return Component;
			}
		}
	});

	t.equal( thisForFoo, ractive );
	t.equal( thisForBar, ractive );
});

test( 'oninit() only fires once on a component (#943 #927), oncomplete fires each render', t => {
	t.expect( 5 );

	const done = t.async();

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
				done();
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

test( 'Double teardown is handled gracefully (#1218)', t => {
	t.expect( 0 );

	onWarn( () => {} ); // suppress

	const Widget = Ractive.extend({
		template: '<p>foo: {{foo}}</p>'
	});

	const ractive = new Ractive({
		el: fixture,
		template: `
			{{#visible}}
				<Widget autoclose='1000' on-teardown='hideChild' />
			{{/visible}}`,
		data: {
			visible: true
		},
		components: { Widget }
	});

	ractive.on( 'hideChild', () => ractive.set( 'visible', false ) );
	ractive.findComponent( 'Widget' ).teardown();
});

test( 'component.teardown() causes component to be removed from the DOM (#1223)', t => {
	onWarn( () => {} ); // suppress

	const Widget = Ractive.extend({
		template: '<p>I am here!</p>'
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<Widget/>',
		components: { Widget }
	});

	ractive.findComponent( 'Widget' ).teardown();
	t.htmlEqual( fixture.innerHTML, '' );
});

test( 'Component CSS is added to the page before components (#1046)', t => {
	const Box = Ractive.extend({
		template: '<div class="box"></div>',
		css: '.box { width: 100px; height: 100px; }',
		onrender () {
			const div = this.find( '.box' );
			t.equal( div.offsetHeight, 100 );
			t.equal( div.offsetWidth, 100 );
		}
	});

	const ractive = new Ractive({
		el: fixture,
		template: '{{#if showBox}}<Box/>{{/if}}',
		components: { Box }
	});

	ractive.set( 'showBox', true );
});

test( 'Decorators and transitions are only initialised post-render, when components are inside elements (#1346)', t => {
	let inDom = {};

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

test( 'Data is synced as soon as an unresolved mapping is resolved', t => {
	onWarn( () => {} ); // suppress

	const ractive = new Ractive({
		el: fixture,
		template: '<Outer/>',
		data: {
			item: { x: 1 }
		},
		components: {
			Outer: Ractive.extend({
				template: '{{#with item}}<Inner foo="{{foo}}"/>{{/with}}'
			}),
			Inner: Ractive.extend({
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
test( 'Mapping to a computed property is an error', t => {
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
test( 'Implicit mappings are created by restricted references (#1465)', t => {
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

test( 'Multiple components two-way binding', t => {
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

	let list = [];

	new Ractive({
		el: fixture,
		template: `
			{{#each list}}
				{{#if bar}}
					<ListBar d='{{.}}'/>
				{{else}}
					<ListFoo d='{{.}}'/>
				{{/if bar}}
			{{/each list}}`,
		components: { ListFoo, ListBar },
		data: { list }
	});

	let list2 = [
		{ foo: 1 },
		{ foo: 2, bar: [ { a: 1 }, { a: 2 }, { a: 3 } ] },
		{ foo: 3 }
	];

	for ( let i = 0; i < list2.length; i++ ) {
		list.push( list2[i] );
	}

	t.htmlEqual( fixture.innerHTML, '11233' );
});

test( 'Explicit mappings with uninitialised data', t => {
	onWarn( () => {} ); // suppress

	const ractive = new Ractive({
		el: fixture,
		template: '<Foo/>',
		components: {
			Foo: Ractive.extend({ template: '<Bar message="{{message}}"/>' }),
			Bar: Ractive.extend({ template: '<Baz message="{{message}}"/>' }),
			Baz: Ractive.extend({ template: '{{message}}' })
		}
	});

	ractive.set( 'message', 'hello' );
	t.htmlEqual( fixture.innerHTML, 'hello' );
});

test( 'Implicit mappings with uninitialised data', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '<Foo message="{{message}}"/>',
		components: {
			Foo: Ractive.extend({ template: '<Bar/>' }),
			Bar: Ractive.extend({ template: '<Baz/>' }),
			Baz: Ractive.extend({ template: '{{message}}' })
		}
	});

	ractive.set( 'message', 'hello' );
	t.htmlEqual( fixture.innerHTML, 'hello' );
});

test( 'Two-way bindings on an unresolved key can force resolution', t => {
	onWarn( () => {} ); // suppress

	const ractive = new Ractive({
		el: fixture,
		template: '{{#context}}<Foo value="{{value}}" />{{/}}',
		components: {
			Foo: Ractive.extend({ template: '<input value="{{value}}" />' })
		},
		data: { context: {} }
	});

	ractive.set( 'context.value', 'hello' );
	t.equal( ractive.find( 'input' ).value, 'hello' );
});

test( 'Component mappings used in computations resolve correctly with the mapping (#1645)', t => {
	onWarn( () => {} ); // suppress

	const ractive = new Ractive({
		el: fixture,
		template: '<C1/>',
		components: {
			C1: Ractive.extend({ template: '<C2 foo="{{bar}}" />' }),
			C2: Ractive.extend({ template: '{{JSON.stringify(foo)}}' })
		},
		onrender () {
			this.set( 'bar', {} );
		}
	});

	t.htmlEqual( fixture.innerHTML, ractive.toHTML() );
});

test( 'Component attributes with no = are boolean true', t => {
	new Ractive({
		el: fixture,
		template: '<Widget foo/>',
		components: { Widget: Ractive.extend({ template: '{{#foo === true}}yep{{/}}' }) }
	});

	t.htmlEqual( fixture.innerHTML, 'yep' );
});

test( 'Component attributes with an empty string come back with an empty string', t => {
	new Ractive({
		el: fixture,
		template: `<Widget foo='' />`,
		components: { Widget: Ractive.extend({ template: `{{#foo === ''}}yep{{/}}` }) }
	});

	t.htmlEqual( fixture.innerHTML, 'yep' );
});

test( 'Unresolved keypath can be safely torn down', t => {
	t.expect( 0 );

	onWarn( () => {} ); // suppress

	const ractive = new Ractive({
		el: fixture,
		template: `<Outer/>`,
		components: {
			Outer: Ractive.extend({ template: `{{#show}}<Inner foo="{{unresolved}}"/>{{/}}` }),
			Inner: Ractive.extend({ template: `{{foo}}` })
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

	new Ractive({
		el: fixture,
		template: `<List names='{{names}}'/>`,
		data: { names },
		components: { List }
	});

	assert.equal( fixture.innerHTML, '333' );
});


test( 'this.parent exists in component.onconstruct() (#2091)', t => {
	const Widget = Ractive.extend({
		template: '<div>component</div>',
		onconstruct () {
			t.ok( this.parent );
		}
	});

	new Ractive({
		el: fixture,
		template: 'Here comes the <Widget/>',
		components: { Widget }
	});
});

test( 'Inline components have a `container` property', t => {
	const ractive = new Ractive({
		template: '<Outer><Inner/></Outer>',
		components: {
			Outer: Ractive.extend({ template: '{{yield}}' }),
			Inner: Ractive.extend()
		}
	});

	t.strictEqual( ractive.findComponent( 'Inner' ).container, ractive.findComponent( 'Outer' ) );
	t.strictEqual( ractive.container, null );
});

test( 'component w/ empty select/option value does not throw (#2139)', t => {
	t.expect( 0 );

	const Component = Ractive.extend({
		template: `
		{{# persons}}
		  <select><option></option></select>
		{{/}}
		`
	});

	var ractive = new Ractive({
		el: fixture,
		template: `
			<Component />
		`,
		data: {
			persons: []
		},
		components: { Component }
	});

	ractive.set('persons', [{}]);
});

test( 'component @keypath references should be relative to the component', t => {
	const cmp = Ractive.extend({
		template: '{{#with foo.bar}}{{@keypath}}{{/with}}'
	});

	new Ractive({
		el: fixture,
		template: '<cmp foo="{{baz.bat}}" />',
		data: {
			baz: { bat: { bar: 'yep' } }
		},
		components: { cmp }
	});

	t.htmlEqual( fixture.innerHTML, 'foo.bar' );
});

test( 'nested component @keypath references should be relative to the nested component', t => {
	const cmp1 = Ractive.extend({
		template: '{{#with foo.bar}}{{@keypath}}{{/with}}'
	}),
	cmp2 = Ractive.extend({
		template: '{{#with baz.bat}}<cmp1 foo="{{.}}" />{{/with}}',
		components: { cmp1 }
	});

	new Ractive({
		el: fixture,
		template: '<cmp2 baz="{{~/bop}}" />',
		data: {
			bop: { bat: { bar: 'yep' } }
		},
		components: { cmp2 }
	});

	t.htmlEqual( fixture.innerHTML, 'foo.bar' );
});

test( 'component @rootpath references should be relative to the root', t => {
	const cmp = Ractive.extend({
		template: '{{#with foo.bar}}{{@rootpath}}{{/with}}'
	});

	new Ractive({
		el: fixture,
		template: '<cmp foo="{{baz.bat}}" />',
		data: {
			baz: { bat: { bar: 'yep' } }
		},
		components: { cmp }
	});

	t.htmlEqual( fixture.innerHTML, 'baz.bat.bar' );
});

test( 'component @keypath references should shuffle correctly', t => {
	const cmp = Ractive.extend({
		template: `{{#with foo.bar}}{{.}} {{@keypath}} {{@rootpath}} {{#each ../list}}{{@keypath}}|{{/each}}{{/with}}`
	});

	const r = new Ractive({
		el: fixture,
		template: '{{#each items as item}}<cmp foo="{{item.baz}}" />{{/each}}',
		data: {
			items: [ { baz: { bar: 1, list: [] } } ],
			flag: false
		},
		components: { cmp }
	});

	t.htmlEqual( fixture.innerHTML, '1 foo.bar items.0.baz.bar' );

	r.unshift( 'items', { baz: { bar: 2, list: [] } } );
	t.htmlEqual( fixture.innerHTML, '2 foo.bar items.0.baz.bar 1 foo.bar items.1.baz.bar' );

	r.push( 'items.1.baz.list', 1 );
	r.unshift( 'items.1.baz.list', 2 );
	t.htmlEqual( fixture.innerHTML, '2 foo.bar items.0.baz.bar 1 foo.bar items.1.baz.bar foo.list.0|foo.list.1|' );

	r.push( 'items.0.baz.list', 1 );
	r.unshift( 'items.0.baz.list', 2 );
	t.htmlEqual( fixture.innerHTML, '2 foo.bar items.0.baz.bar foo.list.0|foo.list.1|1 foo.bar items.1.baz.bar foo.list.0|foo.list.1|' );
});

test( 'component dom has correct keypaths in node info', t => {
	const cmp = Ractive.extend({
		template: '{{#with foo.bar}}<inner />{{/with}}'
	});

	const r = new Ractive({
		el: fixture,
		template: '{{#with baz}}<outer /><cmp foo="{{.bat}}" />{{/with}}',
		data: {
			baz: { bat: { bar: 'yep' } }
		},
		components: { cmp }
	});

	const outer = Ractive.getNodeInfo ( r.find( 'outer' ) ), inner = Ractive.getNodeInfo( r.find( 'inner' ) );

	t.equal( outer.keypath, 'baz' );
	t.equal( outer.rootpath, 'baz' );
	t.equal( inner.keypath, 'foo.bar' );
	t.equal( inner.rootpath, 'baz.bat.bar' );
});
