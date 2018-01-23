import Model from '../../helpers/Model';
import { initModule, onWarn } from '../../helpers/test-config';
import { test } from 'qunit';
import { fire } from 'simulant';

export default function() {
	initModule( 'components/data-and-mappings.js' );

	test( 'Static data is propagated from parent to child', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo}}</p>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget foo="blah"/>',
			components: { Widget }
		});

		const widget = ractive.findComponent( 'Widget' );

		t.equal( widget.get( 'foo' ), 'blah' );
		t.htmlEqual( fixture.innerHTML, '<p>blah</p>' );
	});

	test( 'Static object data is propagated from parent to child', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo.bar}}</p>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: `<Widget foo="{{ { bar: 'biz' } }}"/>`,
			components: { Widget }
		});

		const widget = ractive.findComponent( 'Widget' );
		t.deepEqual( widget.get( 'foo' ), { bar: 'biz' } );
		t.htmlEqual( fixture.innerHTML, '<p>biz</p>' );

		widget.set( 'foo.bar', 'bah' );
		t.deepEqual( widget.get( 'foo' ), { bar: 'bah' } );
		t.htmlEqual( fixture.innerHTML, '<p>bah</p>' );
	});

	test( 'Dynamic data is propagated from parent to child, and (two-way) bindings are created', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo}}</p>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget foo="{{bar}}"/>',
			components: { Widget },
			data: {
				bar: 'blah'
			}
		});

		const widget = ractive.findComponent( 'Widget' );

		t.equal( widget.get( 'foo' ), 'blah' );
		t.htmlEqual( fixture.innerHTML, '<p>blah</p>' );

		ractive.set( 'bar', 'flup' );
		t.equal( widget.get( 'foo' ), 'flup' );
		t.htmlEqual( fixture.innerHTML, '<p>flup</p>' );

		widget.set( 'foo', 'shmup' );
		t.equal( ractive.get( 'bar' ), 'shmup' );
		t.htmlEqual( fixture.innerHTML, '<p>shmup</p>' );
	});

	test( 'Missing data on the parent is added when set', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo}}</p>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget foo="{{missing}}"/>',
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p></p>' );

		ractive.set( 'missing', 'found' );
		t.htmlEqual( fixture.innerHTML, '<p>found</p>' );

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
					template: '{{#with item}}<Inner foo="{{foo}}"/>{{/with}}',
					isolated: false
				}),
				Inner: Ractive.extend({
					template: '<p>foo: {{foo}}</p>',
					isolated: false
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p>foo: </p>' );

		ractive.toggle( 'item.foo' );
		t.htmlEqual( fixture.innerHTML, '<p>foo: true</p>' );

		ractive.toggle( 'item.foo' );
		t.htmlEqual( fixture.innerHTML, '<p>foo: false</p>' );
	});

	test( 'Data on the child is propagated to the parent, if it is not missing', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo}}{{bar}}</p>',
			data: {
				foo: 'yes'
			}
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget foo="{{one}}" bar="{{two}}"/>',
			components: { Widget }
		});

		t.equal( ractive.get( 'one' ), 'yes' );
		t.ok( !( 'two' in ractive.viewmodel.value ) );
		t.htmlEqual( fixture.innerHTML, '<p>yes</p>' );
	});

	test( 'Parent data overrides child data during child model creation', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo}}{{bar}}</p>',
			data: {
				foo: 'yes',
				bar: 'no'
			}
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget foo="{{one}}" bar="{{two}}"/>',
			components: { Widget },
			data: {
				one: 'uno',
				two: 'dos'
			}
		});

		const widget = ractive.findComponent( 'Widget' );

		t.equal( ractive.get( 'one' ), 'uno' );
		t.equal( ractive.get( 'two' ), 'dos' );
		t.equal( widget.get( 'foo' ), 'uno' );
		t.equal( widget.get( 'bar' ), 'dos' );

		t.htmlEqual( fixture.innerHTML, '<p>unodos</p>' );
	});

	test( 'Regression test for #317', t => {
		const Widget = Ractive.extend({
			template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget items="{{items}}"/><p>{{ items.join( " " ) }}</p>',
			data: { items: [ 'a', 'b', 'c', 'd' ] },
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li></ul><p>a b c d</p>' );

		ractive.push( 'items', 'e' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: c</li><li>3: d</li><li>4: e</li></ul><p>a b c d e</p>' );

		ractive.splice( 'items', 2, 1 );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li><li>3: e</li></ul><p>a b d e</p>' );

		ractive.pop( 'items' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: a</li><li>1: b</li><li>2: d</li></ul><p>a b d</p>' );

		ractive.set( 'items[0]', 'f' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li></ul><p>f b d</p>' );

		// reset items from within widget
		const widget = ractive.findComponent( 'Widget' );
		widget.set( 'items', widget.get( 'items' ).slice() );

		widget.push( 'items', 'g' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: b</li><li>2: d</li><li>3: g</li></ul><p>f b d g</p>' );

		widget.splice( 'items', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li><li>2: g</li></ul><p>f d g</p>' );

		widget.pop( 'items' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: f</li><li>1: d</li></ul><p>f d</p>' );

		widget.set( 'items[0]', 'h' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>0: h</li><li>1: d</li></ul><p>h d</p>' );
	});

	test( 'Components can access outer data context, in the same way JavaScript functions can access outer lexical scope', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo || "missing"}}</p>',
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget/><Widget foo="{{bar}}"/><Widget foo="{{baz}}"/>',
			data: {
				foo: 'one',
				bar: 'two'
			},
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p>one</p><p>two</p><p>missing</p>' );

		ractive.set({
			foo: 'three',
			bar: 'four',
			baz: 'five'
		});

		t.htmlEqual( fixture.innerHTML, '<p>three</p><p>four</p><p>five</p>' );
	});


	test( 'Nested components can access outer-most data context', t => {
		const GrandWidget = Ractive.extend({
			template: 'hello {{world}}',
			isolated: false
		});

		const Widget = Ractive.extend({
			template: '<GrandWidget/>',
			components: { GrandWidget },
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget/>',
			components: { Widget },
			data: { world: 'mars' }
		});

		t.htmlEqual( fixture.innerHTML, 'hello mars' );
		ractive.set('world', 'venus');
		t.htmlEqual( fixture.innerHTML, 'hello venus' );
	});

	test( 'Nested components registered at global Ractive can access outer-most data context', t => {
		Ractive.components.Widget = Ractive.extend({
			template: '<GrandWidget/>',
			isolated: false
		});
		Ractive.components.GrandWidget = Ractive.extend({
			template: 'hello {{world}}',
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget/>',
			data: { world: 'mars' }
		});

		t.htmlEqual( fixture.innerHTML, 'hello mars' );
		ractive.set('world', 'venus');
		t.htmlEqual( fixture.innerHTML, 'hello venus' );

		delete Ractive.components.Widget;
		delete Ractive.components.GrandWidget;
	});

	test( 'mixed use of same component parameters across different instances', t => {
		const Widget = Ractive.extend({
			template: '{{foo}}'
		});

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#with obj}}
					<Widget foo='{{bar}}'/>
				{{/with}}

				<Widget foo='{{obj[prop]}}'/>`,
			components: { Widget },
			data: {
				obj: { bar: 'qux' },
				prop: 'bar'
			}
		});

		t.equal( fixture.innerHTML, 'qux qux' );

		const widgets = ractive.findAllComponents( 'Widget' );
		widgets[0].set('foo', 'one');
		t.equal( fixture.innerHTML, 'one one' );
	});

	test( 'Component data passed but non-existent on parent data', t => {
		const Widget = Ractive.extend({
			template: '{{exists}}{{missing}}'
		});

		new Ractive({
			el: fixture,
			template: '<Widget exists="{{exists}}" missing="{{missing}}"/>',
			components: { Widget },
			data: { exists: 'exists' }
		});

		t.htmlEqual( fixture.innerHTML, 'exists' );
	});

	test( 'Some component data not included in invocation parameters', t => {
		const Widget = Ractive.extend({
			template: '{{exists}}{{missing}}'
		});

		new Ractive({
			el: fixture,
			template: '<Widget exists="{{exists}}"/>',
			components: { Widget },
			data: { exists: 'exists' }
		});

		t.htmlEqual( fixture.innerHTML, 'exists' );
	});

	test( 'Some component data not included, with implicit sibling', t => {
		const Widget = Ractive.extend({
			template: '{{exists}}{{also}}{{missing}}'
		});

		new Ractive({
			el: fixture,
			template: '{{#stuff:exists}}<Widget exists="{{exists}}" also="{{.}}"/>{{/stuff}}',
			components: { Widget },
			data: {
				stuff: {
					exists: 'also'
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'existsalso' );
	});

	test( 'Isolated components do not interact with ancestor viewmodels', t => {
		const Widget = Ractive.extend({
			template: '{{foo}}.{{bar}}',
			isolated: true
		});

		new Ractive({
			el: fixture,
			template: '<Widget foo="{{foo}}"/>',
			components: { Widget },
			data: {
				foo: 'you should see me',
				bar: 'but not me'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'you should see me.' );
	});

	test( 'isolated components do not interact with ancestor viewmodels via API (#2335)', t => {
		const cmp = Ractive.extend({
			template: '{{foo}}',
			oninit() {
				this.set( 'foo', this.get( 'bar' ) ? 'nope' : 'yep' );
			},
			isolated: true
		});

		Ractive({
			el: fixture,
			data: { bar: true },
			template: '<cmp />',
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( 'Children do not nuke parent data when inheriting from ancestors', t => {
		const Widget = Ractive.extend({
			template: '<p>value: {{thing.value}}</p>'
		});

		const Block = Ractive.extend({
			template: '<Widget thing="{{things.one}}"/><Widget thing="{{things.two}}"/><Widget thing="{{things.three}}"/>',
			components: { Widget }
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Block/>',
			data: {
				things: {
					one: { value: 1 },
					two: { value: 2 },
					three: { value: 3 }
				}
			},
			components: { Block }
		});

		t.deepEqual( ractive.get( 'things' ), { one: { value: 1 }, two: { value: 2 }, three: { value: 3 } } );
	});

	test( 'Uninitialised implicit dependencies of evaluators that use inherited functions are handled', t => {
		const Widget = Ractive.extend({
			template: '{{status()}}',
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{status()}}-<Widget/>',
			data: {
				status () {
					return this.get( '_status' );
				},
				_status: ''
			},
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '-' );

		ractive.set( '_status', 'foo' );
		t.htmlEqual( fixture.innerHTML, 'foo-foo' );

		ractive.set( '_status', 'bar' );
		t.htmlEqual( fixture.innerHTML, 'bar-bar' );
	});

	test( 'foo.bar should stay in sync between <one foo="{{foo}}"/> and <two foo="{{foo}}"/>', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<One foo="{{foo}}"/><Two foo="{{foo}}"/>',
			components: {
				One: Ractive.extend({ template: '<p>{{foo.bar}}</p>' }),
				Two: Ractive.extend({ template: '<p>{{foo.bar}}</p>' })
			}
		});

		ractive.set( 'foo', {} );
		t.htmlEqual( fixture.innerHTML, '<p></p><p></p>' );

		ractive.findComponent( 'One' ).set( 'foo.bar', 'baz' );
		t.htmlEqual( fixture.innerHTML, '<p>baz</p><p>baz</p>' );

		ractive.findComponent( 'Two' ).set( 'foo.bar', 'qux' );
		t.htmlEqual( fixture.innerHTML, '<p>qux</p><p>qux</p>' );
	});


	test( 'qux.foo.bar should stay in sync between <one foo="{{foo}}"/> and <two foo="{{foo}}"/>', t => {
		const ractive = new Ractive({
			el: fixture,
			data: { qux: { foo: {} } },
			template: `
				{{#with qux}}
					<One foo='{{foo}}'/>
					<Two foo='{{foo}}'/>
				{{/with}}`,
			components: {
				One: Ractive.extend({ template: '<p>{{foo.bar}}</p>' }),
				Two: Ractive.extend({ template: '<p>{{foo.bar}}</p>' })
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p></p><p></p>' );

		ractive.findComponent( 'One' ).set( 'foo.bar', 'baz' );
		t.htmlEqual( fixture.innerHTML, '<p>baz</p><p>baz</p>' );

		ractive.findComponent( 'Two' ).set( 'foo.bar', 'qux' );
		t.htmlEqual( fixture.innerHTML, '<p>qux</p><p>qux</p>' );
	});

	test( 'Index references propagate down to non-isolated components', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each items:i}}
					<Widget letter='{{this}}'/>
				{{/each}}`,
			data: { items: [ 'a', 'b', 'c' ] },
			components: {
				Widget: Ractive.extend({
					template: '<p>{{i}}: {{letter}}</p>',
					isolated: false
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: b</p><p>2: c</p>' );

		ractive.splice( 'items', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: c</p>' );
	});

	test( 'Index references passed via @index propagate down to non-isolated components', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each items}}
					<Widget number='{{@index}}' letter='{{this}}'/>
				{{/each}}`,
			data: { items: [ 'a', 'b', 'c' ] },
			components: {
				Widget: Ractive.extend({
					template: '<p>{{number}}: {{letter}}</p>'
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: b</p><p>2: c</p>' );

		ractive.splice( 'items', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: c</p>' );
	});

	test( 'Reference based fragment parameters update components', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<Widget answer="{{foo}} and {{bar}}"/>',
			data: { foo: 'rice', bar: 'beans' },
			components: {
				Widget: Ractive.extend({
					template: '{{answer}}'
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, 'rice and beans' );

		ractive.set( 'bar', 'more rice' );
		t.htmlEqual( fixture.innerHTML, 'rice and more rice' );
	});

	test( 'Data will propagate up through multiple component boundaries (#520)', t => {
		const Inner = Ractive.extend({
			template: '{{input.value}}',
			update ( val ) {
				this.set( 'input', { value: val });
			}
		});

		const Outer = Ractive.extend({
			template: '{{#inputs}}<Inner input="{{this}}"/>{{/inputs}}',
			components: { Inner }
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{#simulation}}<Outer inputs="{{inputs}}"/>{{/simulation}}',
			components: { Outer },
			data: {
				simulation: { inputs: [{ value: 1 }] }
			}
		});

		t.equal( ractive.get( 'simulation.inputs[0].value' ), 1 );

		const inner = ractive.findComponent( 'Inner' );

		inner.update( 2 );
		t.equal( ractive.get( 'simulation.inputs[0].value' ), 2 );
		t.htmlEqual( fixture.innerHTML, '2' );
	});

	test( 'Component in template has data function called on initialize', t => {
		const data = { foo: 'bar' } ;

		const Widget = Ractive.extend({
			template: '{{foo}}',
			data: () => data
		});

		new Ractive({
			el: fixture,
			template: '<Widget/>',
			components: { Widget },
			data: { foo: 'no' }
		});

		t.equal( fixture.innerHTML, 'bar' );
	});

	// For removal (#1594)
	/*test( 'Component in template having data function with no return uses existing data instance', t => {
		var Component, ractive, data = { foo: 'bar' } ;

		Component = Ractive.extend({
			template: '{{foo}}{{bim}}',
			data: function(d){
				d.bim = 'bam'
			}
		});

		ractive = new Ractive({
			el: fixture,
			template: '<widget/>',
			components: { widget: Component },
			data: { foo: 'bar' }
		});

		t.equal( fixture.innerHTML, 'barbam' );
	});*/

	test( 'Component in template with dynamic template function', t => {
		const Widget = Ractive.extend({
			template () {
				return this.get( 'useFoo' ) ? '{{foo}}' : '{{fizz}}';
			}
		});

		new Ractive({
			el: fixture,
			template: '<Widget foo="{{one}}" fizz="{{two}}" useFoo="true"/>',
			components: { Widget },
			data: { one: 'bar', two: 'bizz' }
		});

		t.equal( fixture.innerHTML, 'bar' );
	});

	test( 'Inline component attributes are passed through correctly', t => {
		const Widget = Ractive.extend({
			template: '<p>{{foo.bar}}</p><p>{{typeof answer}}: {{answer}}</p><p>I got {{string}} but type coercion ain\'t one</p><p>{{dynamic.yes}}</p>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget foo="{bar:10}" answer="42 " string="99 problems" dynamic="{yes:{{but}}}"/>',
			data: { but: 'no' },
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p>10</p><p>number: 42</p><p>I got 99 problems but type coercion ain\'t one</p><p>no</p>' );

		ractive.set( 'but', 'maybe' );
		t.htmlEqual( fixture.innerHTML, '<p>10</p><p>number: 42</p><p>I got 99 problems but type coercion ain\'t one</p><p>maybe</p>' );
	});

	test( 'Inline component attributes update the value of bindings pointing to them even if they are old values (#681)', t => {
		const Widget = Ractive.extend({
			template: '{{childdata}}'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{parentdata}} - <Widget childdata="{{parentdata}}" />',
			data: { parentdata: 'old' },
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, 'old - old' );

		ractive.findComponent( 'Widget' ).set( 'childdata', 'new' );
		t.htmlEqual( fixture.innerHTML, 'new - new' );

		ractive.set( 'parentdata', 'old' );
		t.htmlEqual( fixture.innerHTML, 'old - old' );
	});

	test( 'Insane variable shadowing bug doesn\'t appear (#710)', t => {
		const List = Ractive.extend({
			template: `
				{{#each items:i}}
					<p>{{i}}:{{ foo.bar.length }}</p>
				{{/each}}`
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<List items="{{sorted_items}}"/>',
			components: { List },
			data: () => ({ items: [] }),
			computed: {
				sorted_items () {
					return this.get( 'items' ).slice().sort( ( a, b ) => a.rank - b.rank );
				}
			}
		});

		ractive.set( 'items', [
			{ rank: 2, foo: { bar: []} },
			{ rank: 1, foo: {} },
			{ rank: 3, foo: { bar: []} }
		]);

		t.htmlEqual( fixture.innerHTML, '<p>0:</p><p>1:0</p><p>2:0</p>' );
	});

	test( 'Component bindings propagate the underlying value in the case of adaptors (#945)', t => {
		const Widget = Ractive.extend({
			adapt: [ Model.adaptor ],
			template: '{{#model}}Title: {{title}}{{/model}}'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{#model}}<Widget model="{{this}}"/>{{/model}}',
			data: {
				model: new Model({ title: 'aaa', something: '' })
			},
			components: { Widget }
		});

		ractive.get( 'model' ).set( 'something', 'anything' );
		t.ok( ractive.get( 'model' ) instanceof Model );
	});

	test( 'Implicit bindings are created at the highest level possible (#960)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<Widget/>',
			data: { person: {} },
			components: {
				Widget: Ractive.extend({
					template: '<input value="{{person.first}}"/><input value="{{person.last}}"/>',
					isolated: false
				})
			}
		});

		const widget = ractive.findComponent( 'Widget' );

		widget.findAll( 'input' )[0].value = 'Buzz';
		widget.findAll( 'input' )[1].value = 'Lightyear';
		widget.updateModel();

		t.deepEqual( ractive.get( 'person' ), { first: 'Buzz', last: 'Lightyear' });
		t.equal( ractive.get( 'person' ), widget.get( 'person' ) );
	});

	test( 'Implicit bindings involving context (#975)', t => {
		new Ractive({
			el: fixture,
			template: '{{#context}}<Widget/>{{/}}',
			components: {
				Widget: Ractive.extend({
					template: 'works? {{works}}',
					isolated: false
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

	test( 'Reference expressions default to two-way binding (#996)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each rows:r}}
					{{#columns}}
						<Widget row="{{rows[r]}}" column="{{this}}" />
					{{/columns}}
				{{/each}}
				<pre>{{JSON.stringify(rows)}}</pre>`,
			data: {
				rows: [
					{ name: 'Alice', age: 30 }
				],
				columns: [ 'name', 'age' ]
			},
			components: {
				Widget: Ractive.extend({
					template: '<input value="{{row[column]}}" />'
				})
			}
		});

		const output = ractive.find( 'pre' );
		let widgets = ractive.findAllComponents( 'Widget' );

		widgets[0].find( 'input' ).value = 'Angela';
		widgets[0].updateModel();
		t.deepEqual( JSON.parse( output.innerHTML ), [{ name: 'Angela', age: 30 }] );

		ractive.unshift( 'rows', { name: 'Bob', age: 54 });
		widgets = ractive.findAllComponents( 'Widget' );

		widgets[0].find( 'input' ).value = 'Brian';
		widgets[0].updateModel();

		t.deepEqual( JSON.parse( output.innerHTML ), [{ name: 'Brian', age: 54 }, { name: 'Angela', age: 30 }] );
	});

	test( 'Data that does not exist in a parent context binds to the current instance on set (#1205)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<Widget/><Widget/>',
			components: {
				Widget: Ractive.extend({
					template: '<p>title:{{title}}</p>'
				})
			}
		});

		ractive.findComponent( 'Widget' ).set( 'title', 'foo' );

		t.htmlEqual( fixture.innerHTML, '<p>title:foo</p><p>title:</p>' );
	});

	test( 'Inter-component bindings can be created via this.get() and this.observe(), not just through templates', t => {
		const Widget = Ractive.extend({
			template: '<p>message: {{proxy}}</p>',
			oninit () {
				this.observe( 'message', message => this.set( 'proxy', message ) );
				t.equal( this.get( 'answer' ), 42 );
			},
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget/>',
			data: {
				message: 'hello',
				answer: 42
			},
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p>message: hello</p>' );
		ractive.set( 'message', 'goodbye' );
		t.htmlEqual( fixture.innerHTML, '<p>message: goodbye</p>' );
	});

	test( 'Sibling components do not unnessarily update on refinement update of data. (#1293)', t => {
		let noCall = false;
		let errored = false;

		t.expect( 3 );

		const Widget1 = Ractive.extend({
			template: 'w1:{{tata.foo}}{{tata.bar}}'
		});

		const Widget2 = Ractive.extend({
			template: 'w2:{{schmata.foo}}{{calc}}',
			computed: {
				calc () {
					if ( noCall ) errored = true;
					return this.get( 'schmata.bar' );
				}
			},
			oninit () {
				this.observe('schmata.bar', () => {
					t.ok( false );
				}, { init: false } );
			}
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{data.foo}}{{data.bar}}<Widget1 tata="{{data}}"/><Widget2 schmata="{{data}}"/>',
			data: {
				data: {
					foo: 'foo',
					bar: 'bar'
				}
			},
			components: { Widget1, Widget2 },
			oninit () {
				this.observe( 'data.bar', () => {
					errored = true;
					t.ok( false );
				}, { init: false } );
			}
		});

		t.htmlEqual( fixture.innerHTML, 'foobarw1:foobarw2:foobar' );
		noCall = true;
		ractive.findComponent( 'Widget1' ).set( 'tata.foo', 'update' );
		t.htmlEqual( fixture.innerHTML, 'updatebarw1:updatebarw2:updatebar' );

		t.ok( !errored );
	});

	test( 'Component bindings respect smart updates (#1209)', t => {
		const intros = {};
		const outros = {};

		const Widget = Ractive.extend({
			template: '{{#each items}}<p log-in-out>{{this}}</p>{{/each}}',
			transitions: {
				log ( t ) {
					const x = t.node.innerHTML;
					const count = t.isIntro ? intros : outros;

					if ( !count[x] ) count[x] = 0;
					count[x] += 1;

					t.complete();
				}
			},
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget/>',
			components: { Widget },
			data: { items: [ 'a', 'b', 'c' ]}
		});

		t.deepEqual( intros, { a: 1, b: 1, c: 1 });

		ractive.set( 'items', [ 'a', 'c' ], { shuffle: true } );
		t.deepEqual( outros, { b: 1 });

		ractive.shift( 'items' );
		t.deepEqual( outros, { a: 1, b: 1 });
	});

	test( 'Multiple related values propagate across component boundaries (#1373)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<Tweedle dee="{{dee}}" dum="{{dum}}"/>',
			data: {
				dee: { word: 'spoiled' },
				dum: { word: 'rattle' }
			},
			components: {
				Tweedle: Ractive.extend({
					template: '{{#dee}}{{ word ? word : "lewis"}}{{/dee}} {{#dum}}{{ word? word : "carroll"}}{{/}}'
				})
			}
		});

		ractive.set({
			dee: { word: 'forget' },
			dum: { word: 'quarrel' }
		});

		t.htmlEqual( fixture.innerHTML, 'forget quarrel' );
	});

	test( 'Components unbind their resolvers while they are unbinding (#1428)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each list}}
					<Widget item='{{foo[.]}}'/>
				{{/each}}`,
			components: {
				Widget: Ractive.extend({
					template: '{{item}}'
				})
			},
			data: {
				list: [ 'a', 'b', 'c', 'd' ],
				foo: {
					a: 'rich',
					b: 'john ',
					c: 'jacob ',
					d: 'jingleheimerschmidt'
				}
			}
		});

		ractive.splice( 'list', 0, 1 );
		t.htmlEqual( fixture.innerHTML, 'john jacob jingleheimerschmidt' );
	});

	test( 'Components may bind to the parent root (#1442)', t => {
		new Ractive({
			el: fixture,
			template: '<Foo data="{{.}}" />',
			components: {
				Foo: Ractive.extend({
					template: '{{data.foo}}'
				})
			},
			data: { foo: 'foo!' }
		});

		t.htmlEqual( fixture.innerHTML, 'foo!' );
	});

	test( 'Mappings with reference expressions that change bind correctly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<Widget foo="{{a[p]}}"/>',
			data: {
				a: { b: 'b', c: 'c' },
				p: 'b'
			},
			components: {
				Widget: Ractive.extend({
					template: '{{foo}}'
				})
			}
		});

		t.equal( fixture.innerHTML, 'b' );
		ractive.set( 'p', 'c' );
		t.equal( fixture.innerHTML, 'c' );
	});

	test( 'Mappings with upstream reference expressions that change bind correctly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#a[p]}}<Widget foo="{{bar}}"/>{{/a}}',
			data: {
				a: {
					b: { bar: 'of b' },
					c: { bar: 'of c' }
				},
				p: 'b'
			},
			components: {
				Widget: Ractive.extend({
					template: '{{foo}}'
				})
			}
		});

		t.equal( fixture.innerHTML, 'of b' );
		ractive.set( 'p', 'c' );
		t.equal( fixture.innerHTML, 'of c' );
	});

	// TODO this test needs to be amended for #1594, but maybe so does the behaviour.
	// Should ractive.get('') include mapped and computed properties? (Maybe with an option?)
	/*test( 'ComponentData supports JSON.stringify', (t) => {
		var ractive = new Ractive({
			el: fixture,
			template: `<cmp foo="bar" baz="{{.}}" />`,
			components: {
				cmp: Ractive.extend({
					template: `{{JSON.stringify(.)}} {{foo}} {{baz.bippy}} {{bat}}`,
					onconstruct: function ( options ) {
						options.data.bat = 1;
					}
				})
			},
			data: { bippy: 'boppy' }
		});

		t.htmlEqual( fixture.innerHTML, JSON.stringify( { bat:1, foo:'bar', baz:{ bippy:'boppy' } } ) + ' bar boppy 1' );
	});*/

	// Removing for #1594
	/*test( 'ComponentData supports in operator', (t) => {
		let ractive = new Ractive({
			el: fixture,
			template: `<cmp flag foo="bar" baz="{{.}}" />`,
			components: {
				cmp: Ractive.extend({
					template: `{{JSON.stringify(.)}} {{foo}} {{baz.bippy}} {{bat}}`,
					onconstruct: function() {
						this.data.bat = 1;
					}
				})
			},
			data: { bippy: 'boppy' }
		});

		let cmp = ractive.findComponent('cmp').data;

		t.ok( 'flag' in cmp );
		t.ok( 'foo' in cmp );
		t.ok( 'baz' in cmp );
		t.ok( 'bat' in cmp );
	});*/

	test( 'Multiple levels of mappings work', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{a}}-{{b}}-{{c}}:<C1 d="{{a}}" e="{{b}}" f="{{c}}"/>',
			data: {
				a: 'foo',
				b: 'bar'
			},
			components: {
				C1: Ractive.extend({
					template: '{{d}}-{{e}}-{{f}}:<C2 g="{{d}}" h="{{e}}" i="{{f}}"/>',
					components: {
						C2: Ractive.extend({
							template: '{{g}}-{{h}}-{{i}}'
						})
					}
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, 'foo-bar-:foo-bar-:foo-bar-' );
		ractive.set( 'c', 'qux' );
		t.htmlEqual( fixture.innerHTML, 'foo-bar-qux:foo-bar-qux:foo-bar-qux' );
	});

	test( 'Bindings, mappings, and upstream computations should not cause infinite mark recursion (#1526)', t => {
		new Ractive({
			el: fixture,
			template: '{{JSON.stringify(.)}}<widget foo="{{bar}}" /><input value="{{bar}}" />',
			components: { widget: Ractive.extend({ template: '{{foo}}' }) }
		});

		t.htmlEqual( fixture.innerHTML, '{"bar":""}<input />' );
	});

	test( 'components should update their mappings on rebind to prevent weirdness with shuffling (#2147)', t => {
		const Item = Ractive.extend({
			template: '{{value}}',
			isolated: false
		});

		const ractive = new Ractive({
			el:fixture,
			template: `
				<div>--23--</div>
				<div id="s1">{{#s1}}<Item />{{/}}</div>
				<div>--13--</div>
				<div id="s2">{{#s2}}<Item />{{/}}</div>
				<div>--12--</div>
				<div id="s3">{{#s3}}<Item />{{/}}</div>
			`,
			components: { Item },
		});

		const items = [ { value: 1 }, { value: 2 }, { value: 3 } ];

		ractive.set('s1', items.slice() );
		ractive.splice( 's1', 0, 1 );
		t.deepEqual( ractive.get( 's1' ), [ { value: 2 }, { value: 3 } ] );
		t.htmlEqual( ractive.find( '#s1' ).innerHTML, '23' );

		ractive.set('s2', items.slice() );
		ractive.splice( 's2', 1, 1 );
		t.deepEqual( ractive.get( 's2' ), [ { value: 1 }, { value: 3 } ] );
		t.htmlEqual( ractive.find( '#s2' ).innerHTML, '13' );

		ractive.set('s3', items.slice() );
		ractive.splice( 's3', 2, 1 );
		t.deepEqual( ractive.get( 's3' ), [ { value: 1 }, { value: 2 } ] );
		t.htmlEqual( ractive.find( '#s3' ).innerHTML, '12' );
	});

	test( 'updates to children of mappings update correctly in the parent (#2469)', t => {
		const cmp = Ractive.extend({
			template: '{{#each foo.baz}}{{@key}}{{/each}}'
		});

		const r = new Ractive({
			el: fixture,
			template: `<cmp foo="{{bar}}" />-`,
			data: {
				bar: { baz: { a: 1, b: 2 } }
			},
			components: { cmp }
		});

		t.equal( fixture.innerHTML, 'ab-' );

		const c = r.findComponent( 'cmp' );

		delete c.get( 'foo' ).baz.a;
		c.update( 'foo.baz.a' );

		t.equal( fixture.innerHTML, 'b-' );
	});

	test( 'Interpolators based on computed mappings update correctly #2261)', t => {
		const Component = Ractive.extend({
			template: `{{active ? "active" : "inactive"}}`
		});

		const ractive = new Ractive({
			el: fixture,
			template: `
			<Component active="{{tab == 'foo'}}"/>
			<Component active="{{tab == 'bar'}}"/>`,
			data: {
				tab: 'foo'
			},
			components: { Component }
		});

		t.htmlEqual( fixture.innerHTML, 'active inactive' );
		ractive.set( 'tab', 'bar' );
		t.htmlEqual( fixture.innerHTML, 'inactive active' );
	});

	test( 'conditional mapping updates correctly', t => {
		const cmp = Ractive.extend({
			template: '{{foo}}'
		});

		const r = new Ractive({
			el: fixture,
			template: '<cmp {{#if cond}}foo="{{bar}}"{{else}}foo="{{baz}}"{{/if}} />',
			data: { cond: true, bar: 'bar', baz: 'baz' },
			components: { cmp }
		});

		t.equal( fixture.innerHTML, 'bar' );
		r.toggle( 'cond' );
		t.equal( fixture.innerHTML, 'baz' );
		r.toggle( 'cond' );
		t.equal( fixture.innerHTML, 'bar' );
	});

	test( 'conditional mappings unmap correctly', t => {
		const cmp = Ractive.extend({
			template: '{{foo}}'
		});

		const r = new Ractive({
			el: fixture,
			template: '<cmp {{#if cond}}foo="{{bar}}"{{/if}} />',
			data: { cond: true, bar: 'bar' },
			components: { cmp }
		});

		t.equal( fixture.innerHTML, 'bar' );
		r.toggle( 'cond' );
		t.equal( fixture.innerHTML, '' );
		r.toggle( 'cond' );
		t.equal( fixture.innerHTML, 'bar' );
	});


	test( 'root references inside a component should resolve to the component', t => {
		const cmp = Ractive.extend({
			template: '{{#with foo.bar}}{{~/test}}{{/with}}',
			data() {
				return { test: 'yep' };
			}
		});

		new Ractive({
			el: fixture,
			template: '<cmp foo="{{baz.bat}}" />',
			components: { cmp },
			data: {
				baz: { bat: { bar: 1 } }
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( 'complex mappings continue to update with their dependencies', t => {
		const cmp = Ractive.extend({
			template: '{{foo}}',
			isolated: false
		});
		const r = new Ractive({
			el: fixture,
			template: '<cmp foo="foo? {{bar}}" />',
			components: { cmp }
		});

		const c = r.findComponent( 'cmp' );

		r.set( 'bar', 'maybe' );
		t.equal( c.get( 'bar' ), 'maybe' );
		t.htmlEqual( fixture.innerHTML, 'foo? maybe' );
		r.set( 'bar', 'yes' );
		t.equal( c.get( 'bar' ), 'yes' );
		t.htmlEqual( fixture.innerHTML, 'foo? yes' );
	});

	test( `complex mappings work with a single section (#2444)`, t => {
		const cmp = Ractive.extend({
			template: '{{foo}}'
		});
		const r = new Ractive({
			el: fixture,
			template: '<cmp foo="{{#if thing}}{{thing}} is yep{{/if}}" />',
			components: { cmp },
			data: { thing: '' }
		});

		r.set( 'thing', 'hey' );
		t.htmlEqual( fixture.innerHTML, 'hey is yep' );
	});

	test( 'complex mapped reference expressions update correctly', t => {
		const cmp = Ractive.extend({
			template: '<input value="{{foo[wat][yep + \'z\']}}" />',
			data: {
				wat: 'bar',
				yep: 'ba'
			}
		});
		const cmp2 = Ractive.extend({
			template: '<cmp foo="{{foo[geez][complic + \'ated\']}}" />',
			data: {
				geez: 'a',
				complic: 'complic'
			},
			components: { cmp }
		});
		const r = new Ractive({
			el: fixture,
			template: '<cmp foo="{{bop[bat + \'a\'][bip]}}" />',
			data: {
				bop: { a: { b: { a: { complicated: { bar: { baz: 'hello' } } } } } },
				bat: '',
				bip: 'b'
			},
			components: { cmp: cmp2 }
		});

		const info = r.getContext( 'input' );
		t.equal( info.getBinding(), 'hello' );
		info.setBinding( 'yep' );
		t.equal( info.getBinding(), 'yep' );
	});

	test( `shuffling a link to a link to a list doesn't blow the stack (#2699)`, t => {
		t.expect( 0 );

		const cmp1 = Ractive.extend({ template: '<cmp2 list="{{list}}" />', isolated: false });
		const cmp2 = Ractive.extend({ template: '<cmp3 list="{{list}}" />', isolated: false });
		const cmp3 = Ractive.extend({ isolated: false });
		const r = new Ractive({
			el: fixture,
			template: '<cmp1 list="{{items}}" />',
			data: { items: [] },
			components: { cmp1, cmp2, cmp3 }
		});

		r.findComponent( 'cmp3' ).push( 'list', 1 );
	});

	test( `shuffling a link to a link to a list updates correctly`, t => {
		t.expect( 2 );

		const cmp1 = Ractive.extend({ template: '<cmp2 list="{{list}}" />', isolated: false });
		const cmp2 = Ractive.extend({ template: '{{#each list}}{{.}}{{/each}}<cmp3 list="{{list}}" />', isolated: false });
		const cmp3 = Ractive.extend({ isolated: false });
		const r = new Ractive({
			el: fixture,
			template: '<cmp1 list="{{items}}" />',
			data: { items: [] },
			components: { cmp1, cmp2, cmp3 }
		});

		r.findComponent( 'cmp3' ).push( 'list', 1 );
		t.htmlEqual( fixture.innerHTML, '1' );
		r.findComponent( 'cmp2' ).unshift( 'list', 2 );
		t.htmlEqual( fixture.innerHTML, '21' );
	});

	test( `computed properties can be mapped`, t => {
		const cmp = Ractive.extend({ template: '{{foo.0}} {{foo.length}}' });
		const r = new Ractive({
			el: fixture,
			template: `<cmp foo="{{list}}" />`,
			computed: {
				list () {
					return this.get('my.list');
				}
			},
			data: {
				my: {
					list: [ 1, 2, 3 ]
				}
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '1 3' );
		r.unshift( 'my.list', 4 );
		t.htmlEqual( fixture.innerHTML, '4 4' );
	});

	test( `parent data can be referenced via special model to avoid computations with get`, t => {
		const cmp = Ractive.extend({ template: '{{@.parent.data.foo}}' });
		const r = new Ractive({
			target: fixture,
			template: '<cmp />',
			data: { foo: 'bar' },
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'bar' );
		r.set( 'foo', 'baz' );
		t.htmlEqual( fixture.innerHTML, 'baz' );
	});

	test( `mapped functions are bound to the right root context (#2552)`, t => {
		const cmp = Ractive.extend({
			template: '{{foo()}}',
			data: {
				bar: 'baz'
			}
		});
		new Ractive({
			target: fixture,
			template: '<cmp foo="{{a.fn}}" />',
			data: {
				a: { fn() { return this.get('bar'); } },
				bar: 'nope'
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'baz' );
	});

	test( `component attributes can contain stringified jsonish values`, t => {
		const cmp = Ractive.extend();
		const r = new Ractive({
			target: fixture,
			template: `<cmp json="{ foo: [1,2,3], bar: { baz: true }, bat: 'yep' }" />`,
			components: { cmp }
		});

		t.equal( JSON.stringify( r.findComponent().get( 'json' ) ), JSON.stringify( { foo: [1,2,3], bar: { baz: true }, bat: 'yep' } ) );
	});

	test( `mappings don't try to initialize a parent computed property that is readonly (#2888)`, t => {
		const cmp = Ractive.extend({
			data: { foo: 1 },
			template: `{{'' + foo}}`
		});
		new Ractive({
			el: fixture,
			template: '<cmp foo="{{foo}}" />',
			components: { cmp },
			computed: {
				foo () {}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'undefined' );
	});

	test( `linking a mapped path triggers updates to the DOM (#2924)`, t => {
		const cmp = Ractive.extend({
			template: '{{#if foo.bar}}yep{{else}}nope{{/if}}'
		});

		new Ractive({
			el: fixture,
			template: '<cmp foo="{{baz}}" />',
			data: {
				bat: { bar: true }
			},
			components: { cmp },
			oninit () {
				this.link( 'bat', 'baz' );
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( `static mappings copy value into the child if the value (#2897)`, t => {
		const cmp = Ractive.extend({
			template: '{{foo}}'
		});

		const r = new Ractive({
			el: fixture,
			template: '{{bar}} <cmp foo="[[bar]]" />',
			data: {
				bar: 42
			},
			components: { cmp }
		});

		t.equal( fixture.innerHTML, '42 42' );
		r.set( 'bar', 99 );
		t.equal( fixture.innerHTML, '99 42' );
		r.findComponent( 'cmp' ).set( 'foo', 21 );
		t.equal( fixture.innerHTML, '99 21' );
	});

	test( `static mappings won't copy non-computed objects`, t => {
		t.expect( 2 );

		const cmp = Ractive.extend({
			template: '{{foo.bar}} {{baz.bat}}'
		});

		onWarn(m => {
			t.ok( /cannot copy non-computed.*baz/i.test( m ) );
		});

		new Ractive({
			el: fixture,
			template: `<cmp foo="[[{ bar: 123 }]]" baz="[[bip]]" />`,
			data: {
				bip: { bat: 42 }
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '123' );
	});

	test( `non-isolated components can implicitly map on set (#2963)`, t => {
		const cmp = Ractive.extend({
			isolated: false
		});
		const r = new Ractive({
			target: fixture,
			template: '<cmp/>',
			components: { cmp },
			data: {
				foo: { bar: 42 }
			}
		});

		let c = r.findComponent( 'cmp' );
		c.set( 'foo.bar', 84 );
		t.equal( r.get( 'foo.bar' ), 84 );

		r.set( 'foo.bar', 99 );
		t.equal( c.get( 'foo.bar' ), 99 );

		r.unrender();
		r.render();

		c = r.findComponent( 'cmp' );
		c.add( 'foo.bar', 1 );
		t.equal( r.get( 'foo.bar' ), 100 );

		r.unrender();
		r.render();

		c = r.findComponent( 'cmp' );
		c.toggle( 'foo.bar' );
		t.equal( r.get( 'foo.bar' ), false );
	});

	test( `non-isolated components don't implicitly map on set when asked not to`, t => {
		const cmp = Ractive.extend({
			isolated: false
		});
		const r = new Ractive({
			target: fixture,
			template: '<cmp/>',
			components: { cmp },
			data: {
				foo: { bar: 42 }
			}
		});

		let c = r.findComponent( 'cmp' );
		c.set( 'foo.bar', 84, { isolated: true });
		t.equal( r.get( 'foo.bar' ), 42 );
		t.equal( c.get( 'foo.bar' ), 84 );

		r.set( 'foo.bar', 99 );
		t.equal( c.get( 'foo.bar' ), 84 );

		r.unrender();
		r.render();

		c = r.findComponent( 'cmp' );
		t.throws(() => c.add( 'foo.bar', 1, { isolated: true }), /cannot add to a non-numeric/i );
		t.equal( r.get( 'foo.bar' ), 99 );

		r.unrender();
		r.render();

		c = r.findComponent( 'cmp' );
		c.toggle( 'foo.bar', { isolated: true });
		t.equal( r.get( 'foo.bar' ), 99 );
		t.equal( c.get( 'foo.bar' ), true );
	});

	test( `keypath mappings map to nested keypaths`, t => {
		new Ractive({
			target: fixture,
			template: `<cmp foo.bar="{{baz}}" />`,
			data: {
				baz: 42
			},
			components: {
				cmp: Ractive.extend({
					template: `{{foo.bar}}`
				})
			}
		});

		t.equal( fixture.innerHTML, '42' );
	});

	test( `mapped functions should be bound to the source instance (#3031)`, t => {
		const cmp = Ractive.extend({
			template: '{{foo()}}',
			data() {
				return {
					bar: 'nope'
				};
			}
		});

		new Ractive({
			target: fixture,
			components: { cmp },
			template: `<cmp bind-foo />`,
			data: {
				foo() { return this.get('bar'); },
				bar: 'yep'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( `mapped indices should update correctly on shuffle (#3042)`, t => {
		const child = Ractive.extend({
			template: `{{index}} {{item}}<button on-click="@this.parent.splice('list', index, 1)">rm</button>`
		});

		const r = new Ractive({
			target: fixture,
			template: `{{#each list:i}}<child bind-index=i bind-item=. />{{/each}}`,
			components: { child },
			data: { list: [ 'dave', 'joe', 'susan', 'marie' ] }
		});

		t.htmlEqual( fixture.innerHTML, '0 dave<button>rm</button>1 joe<button>rm</button>2 susan<button>rm</button>3 marie<button>rm</button>' );

		fire( r.findAll( 'button' )[1], 'click' );

		t.htmlEqual( fixture.innerHTML, '0 dave<button>rm</button>1 susan<button>rm</button>2 marie<button>rm</button>' );

		fire( r.findAll( 'button' )[1], 'click' );

		t.htmlEqual( fixture.innerHTML, '0 dave<button>rm</button>1 marie<button>rm</button>' );

		fire( r.findAll( 'button' )[1], 'click' );

		t.htmlEqual( fixture.innerHTML, '0 dave<button>rm</button>' );
	});
}
