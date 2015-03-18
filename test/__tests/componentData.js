import Model from 'helpers/Model';

module( 'Component Data' );

test( 'Static data is propagated from parent to child', t => {
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

test( 'Static object data is propagated from parent to child', t => {
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

test( 'Dynamic data is propagated from parent to child, and (two-way) bindings are created', t => {
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

test( 'Missing data on the parent is added when set', t => {
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
	t.htmlEqual( fixture.innerHTML, '<p>found</p>' );

});

test( 'Data on the child is propagated to the parent, if it is not missing', t => {
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
	t.ok( !( 'two' in ractive.viewmodel.data ) );
	t.htmlEqual( fixture.innerHTML, '<p>yes</p>' );
});

test( 'Parent data overrides child data during child model creation', t => {
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

test( 'Regression test for #317', t => {
	var Widget, widget, ractive, items;

	Widget = Ractive.extend({
		template: '<ul>{{#items:i}}<li>{{i}}: {{.}}</li>{{/items}}</ul>',
		oninit: function () {
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

test( 'Components can access outer data context, in the same way JavaScript functions can access outer lexical scope', t => {
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


test( 'Nested components can access outer-most data context', t => {
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

test( 'Nested components registered at global Ractive can access outer-most data context', t => {
	var ractive, Widget;

	Ractive.components.widget = Ractive.extend({
		template: '<grandwidget/>'
	});
	Ractive.components.grandwidget = Ractive.extend({
		template: 'hello {{world}}'
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

test( 'mixed use of same component parameters across different instances', t => {
	var ractive, Widget, widgets;

	Widget = Ractive.extend({
		template: '{{foo}}'
	});

	ractive = new Ractive({
		el: fixture,
		template:  //	`{{obj.bar}}
					`{{#with obj}}
						<widget foo="{{bar}}"/>
					` +
						// <widget foo="{{@keypath}}"/>
					`{{/with}}` +
					// <widget foo="static"/>
					// <widget foo="{{prop}}-{{obj.bar}}"/>
					`<widget foo="{{obj[prop]}}"/>`,
		components: { widget: Widget },
		data: {
			obj: { bar: 'qux' },
			prop: 'bar'
		}
	});

	// t.equal( fixture.innerHTML, 'qux qux obj static bar-qux qux' );
	t.equal( fixture.innerHTML, 'qux qux' );

	widgets = ractive.findAllComponents( 'widget' );
	widgets[0].set('foo', 'one');
	// t.equal( fixture.innerHTML, 'one one obj static bar-one one' );
	t.equal( fixture.innerHTML, 'one one' );
	// widgets[1].set('foo', 'two');
	// t.equal( fixture.innerHTML, 'one one two static bar-one one' );
	// widgets[2].set('foo', 'notstatic');
	// t.equal( fixture.innerHTML, 'one one two notstatic bar-one one' );
	// widgets[3].set('foo', 'notcomplex');
	// t.equal( fixture.innerHTML, 'one one two notstatic notcomplex one' );
	// // keypath expressions ARE bound!
	// widgets[4].set('foo', 'bound');
	// t.equal( fixture.innerHTML, 'bound bound two notstatic bar-bound bound' );
});

if ( Ractive.magic ) {

	test( 'Data passed into component updates from outside component in magic mode', t => {
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

	test( 'Indirect changes propagate across components in magic mode (#480)', t => {
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

		ractive.get( 'foo.bar' ).baz = 1337;
		//t.equal( ractive.data.foo.bar.baz, 1337 );
		t.equal( ractive.get( 'foo.bar.baz' ), 1337 );

		blocker = ractive.findComponent( 'blocker' );

		blocker.set( 'foo.bar.baz', 42 );
		t.equal( blocker.get( 'foo.bar.baz' ), 42 );

		//blocker.data.foo.bar.baz = 1337;
		blocker.set( 'foo.bar.baz', 1337 ); // TODO necessary since #1373. Might need to review some of these tests
		//t.equal( blocker.data.foo.bar.baz, 1337 );
		t.equal( blocker.get( 'foo.bar.baz' ), 1337 );
	});
} // end "Ractive.magic" section

test( 'Component data passed but non-existent on parent data', t => {
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

test( 'Some component data not included in invocation parameters', t => {
	var ractive, Widget;

	Widget = Ractive.extend({
		template: '{{exists}}{{missing}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget exists="{{exists}}"/>',
		components: { widget: Widget },
		data: { exists: 'exists' }
	});

	t.htmlEqual( fixture.innerHTML, 'exists' );
});

test( 'Some component data not included, with implicit sibling', t => {
	var ractive, Widget;

	Widget = Ractive.extend({
		template: '{{exists}}{{also}}{{missing}}'
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

test( 'Isolated components do not interact with ancestor viewmodels', t => {
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

test( 'Children do not nuke parent data when inheriting from ancestors', t => {
	var Widget, Block, ractive;

	Widget = Ractive.extend({
		template: '<p>value: {{thing.value}}</p>'
	});

	Block = Ractive.extend({
		template: '<widget thing="{{things.one}}"/><widget thing="{{things.two}}"/><widget thing="{{things.three}}"/>',
		components: { widget: Widget }
	});

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

test( 'Uninitialised implicit dependencies of evaluators that use inherited functions are handled', t => {
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

test( 'foo.bar should stay in sync between <one foo="{{foo}}"/> and <two foo="{{foo}}"/>', t => {
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

test( 'Index references propagate down to non-isolated components', t => {
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

test( 'Index references passed via @index propagate down to non-isolated components', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#items:i}}<widget number="{{@index}}" letter="{{.}}"/>{{/items}}',
		data: { items: [ 'a', 'b', 'c' ] },
		components: {
			widget: Ractive.extend({
				template: '<p>{{number}}: {{letter}}</p>'
			})
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: b</p><p>2: c</p>' );

	ractive.get( 'items' ).splice( 1, 1 );
	t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: c</p>' );
});

test( 'Reference based fragment parameters update components', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '<widget answer="{{foo}} and {{bar}}"/>',
		data: { foo: 'rice', bar: 'beans' },
		components: {
			widget: Ractive.extend({
				template: '{{answer}}'
			})
		}
	});

	t.htmlEqual( fixture.innerHTML, 'rice and beans' );

	ractive.set( 'bar', 'more rice' );
	t.htmlEqual( fixture.innerHTML, 'rice and more rice' );
});

test( 'Data will propagate up through multiple component boundaries (#520)', t => {
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

test( 'Component in template has data function called on initialize', t => {
	var Component, ractive, data = { foo: 'bar' } ;

	Component = Ractive.extend({
		template: '{{foo}}',
		data: function(){ return data }
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget/>',
		components: { widget: Component },
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
	var Component, ractive;

	Component = Ractive.extend({
		template () {
			return this.get( 'useFoo' ) ? '{{foo}}' : '{{fizz}}';
		}
	});


	ractive = new Ractive({
		el: fixture,
		template: '<widget foo="{{one}}" fizz="{{two}}" useFoo="true"/>',
		components: { widget: Component },
		data: { one: 'bar', two: 'bizz' }
	});

	t.equal( fixture.innerHTML, 'bar' );
});

test( 'Inline component attributes are passed through correctly', t => {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '<p>{{foo.bar}}</p><p>{{typeof answer}}: {{answer}}</p><p>I got {{string}} but type coercion ain\'t one</p><p>{{dynamic.yes}}</p>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget foo="{bar:10}" answer="42 " string="99 problems" dynamic="{yes:{{but}}}"/>',
		data: { but: 'no' },
		components: { widget: Widget }
	});

	t.htmlEqual( fixture.innerHTML, '<p>10</p><p>number: 42</p><p>I got 99 problems but type coercion ain\'t one</p><p>no</p>' );

	ractive.set( 'but', 'maybe' );
	t.htmlEqual( fixture.innerHTML, '<p>10</p><p>number: 42</p><p>I got 99 problems but type coercion ain\'t one</p><p>maybe</p>' );
});

// See issue #681
test( 'Inline component attributes update the value of bindings pointing to them even if they are old values', t => {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '{{childdata}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '{{parentdata}} - <widget childdata="{{parentdata}}" />',
		data: { parentdata: 'old' },
		components: { widget: Widget }
	});

	t.htmlEqual( fixture.innerHTML, 'old - old' );

	ractive.findComponent( 'widget' ).set( 'childdata', 'new' );
	t.htmlEqual( fixture.innerHTML, 'new - new' );

	ractive.set( 'parentdata', 'old' );
	t.htmlEqual( fixture.innerHTML, 'old - old' );
});

test( 'Insane variable shadowing bug doesn\'t appear (#710)', t => {
	var List, ractive;

	List = Ractive.extend({
		template: '{{#items:i}}<p>{{i}}:{{ foo.bar.length }}</p>{{/items}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<list items="{{sorted_items}}"/>',
		components: {
			list: List
		},
		computed: {
			sorted_items: function () {
				return this.get( 'items' ).slice().sort( function ( a, b ) {
					return ( a.rank - b.rank );
				});
			}
		}
	});

	ractive.set( 'items', [
		{ rank: 2, "foo": {"bar": []} },
		{ rank: 1, "foo": {} },
		{ rank: 3, "foo": {"bar": []} }
	]);

	t.htmlEqual( fixture.innerHTML, '<p>0:</p><p>1:0</p><p>2:0</p>' );
});

test( 'Component bindings propagate the underlying value in the case of adaptors (#945)', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		adapt: [ Model.adaptor ],
		template: '{{#model}}Title: {{title}}{{/model}}'
	});

	ractive = new Ractive({
		el: fixture,
		template: '{{#model}}<widget model="{{this}}"/>{{/model}}',
		data: {
			model: new Model({"title": "aaa", "something": ""})
		},
		components: {
			widget: Widget
		}
	});

	ractive.get("model").set("something", "anything");
	t.ok( ractive.get( 'model' ) instanceof Model );
});

test( 'Implicit bindings are created at the highest level possible (#960)', function ( t ) {
	var ractive, widget;

	ractive = new Ractive({
		el: fixture,
		template: '<widget/>',
		data: { person: {} },
		components: {
			widget: Ractive.extend({
				template: '<input value="{{person.first}}"/><input value="{{person.last}}"/>'
			})
		}
	});

	widget = ractive.findComponent( 'widget' );

	widget.findAll( 'input' )[0].value = 'Buzz';
	widget.findAll( 'input' )[1].value = 'Lightyear';
	widget.updateModel();

	t.deepEqual( ractive.get( 'person' ), { first: 'Buzz', last: 'Lightyear' });
	t.equal( ractive.get( 'person' ), widget.get( 'person' ) );
});

test( 'Implicit bindings involving context (#975)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#context}}<widget/>{{/}}',
		components: {
			widget: Ractive.extend({
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

test( 'Reference expressions default to two-way binding (#996)', function ( t ) {
	var ractive, widgets, output;

	ractive = new Ractive({
		el: fixture,
		template: `
			{{#each rows:r}}
				{{#columns}}
					<widget row="{{rows[r]}}" column="{{this}}" />
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
			widget: Ractive.extend({
				template: '<input value="{{row[column]}}" />'
			})
		}
	});

	output = ractive.find( 'pre' );
	widgets = ractive.findAllComponents( 'widget', { live: true });

	widgets[0].find( 'input' ).value = 'Angela';
	widgets[0].updateModel();
	t.deepEqual( JSON.parse( output.innerHTML ), [{ name: 'Angela', age: 30 }] );

	ractive.unshift( 'rows', { name: 'Bob', age: 54 });
	widgets[0].find( 'input' ).value = 'Brian';
	widgets[0].updateModel();
	t.deepEqual( JSON.parse( output.innerHTML ), [{ name: 'Brian', age: 54 }, { name: 'Angela', age: 30 }] );
});

test( 'Data that does not exist in a parent context binds to the current instance on set (#1205)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<widget/><widget/>',
		components: {
			widget: Ractive.extend({
				template: '<p>title:{{title}}</p>'
			})
		}
	});

	ractive.findComponent( 'widget' ).set( 'title', 'foo' );

	t.htmlEqual( fixture.innerHTML, '<p>title:foo</p><p>title:</p>' );
});

test( 'Inter-component bindings can be created via this.get() and this.observe(), not just through templates', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '<p>message: {{proxy}}</p>',
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

test( 'Sibling components do not unnessarily update on refinement update of data. (#1293)', function ( t ) {
	var ractive, Widget1, Widget2, noCall = false, errored = false;

	expect( 3 );

	Widget1 = Ractive.extend({
		debug: true,
		template: 'w1:{{tata.foo}}{{tata.bar}}'
	});

	Widget2 = Ractive.extend({
		debug: true,
		template: 'w2:{{schmata.foo}}{{calc}}',
		computed: {
			calc () {
				if ( noCall ) errored = true;
				return this.get( 'schmata.bar' );
			}
		},
		oninit () {
			this.observe('schmata.bar', function () {
				t.ok( false );
			}, { init: false } );
		}
	});

	ractive = new Ractive({
		el: fixture,
		template: '{{data.foo}}{{data.bar}}<widget1 tata="{{data}}"/><widget2 schmata="{{data}}"/>',
		data: {
			data: {
				foo: 'foo',
				bar: 'bar'
			}
		},
		components: {
			widget1: Widget1,
			widget2: Widget2
		},
		oninit: function () {
			this.observe('data.bar', function () {
				errored = true;
				t.ok( false );
			}, { init: false } );
		}
	});

	t.htmlEqual( fixture.innerHTML, 'foobarw1:foobarw2:foobar' );
	noCall = true;
	ractive.findComponent('widget1').set( 'tata.foo', 'update' );
	t.htmlEqual( fixture.innerHTML, 'updatebarw1:updatebarw2:updatebar' );

	t.ok( !errored );

});

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

test( 'Multiple related values propagate across component boundaries (#1373)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<tweedle dee="{{dee}}" dum="{{dum}}"/>',
		data: {
			dee: { word: 'spoiled' },
			dum: { word: 'rattle' }
		},
		components: {
			tweedle: Ractive.extend({
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
	let ractive = new Ractive({
		el: fixture,
		template: '{{#list}}<cmp item="{{foo[.]}}" />{{/}}',
		components: {
			cmp: Ractive.extend({
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

	ractive.splice('list', 0, 1);

	t.htmlEqual( fixture.innerHTML, 'john jacob jingleheimerschmidt' );
});

test( 'Components may bind to the parent root (#1442)', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '<foo data="{{.}}" />',
		components: {
			foo: Ractive.extend({
				template: '{{data.foo}}'
			})
		},
		data: { foo: 'foo!' }
	});

	t.htmlEqual( fixture.innerHTML, 'foo!' );
});

test( 'Mappings with reference expressions that change bind correctly', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '<widget foo="{{a[p]}}"/>',
		data: {
			a: { b: 'b', c: 'c' },
			p: 'b'
		},
		components: {
			widget: Ractive.extend({
				template: '{{foo}}'
			})
		}
	});

	t.equal( fixture.innerHTML, 'b' );
	ractive.set( 'p', 'c' );
	t.equal( fixture.innerHTML, 'c' );
});

test( 'Mappings with upstream reference expressions that change bind correctly', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#a[p]}}<widget foo="{{bar}}"/>{{/a}}',
		data: {
			a: {
				b: { bar: 'of b' },
				c: { bar: 'of c' }
			},
			p: 'b'
		},
		components: {
			widget: Ractive.extend({
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

test( 'Multiple levels of mappings work', ( t ) => {

	var ractive = new Ractive({
		el: fixture,
		template: '{{a}}-{{b}}-{{c}}:<c1 d="{{a}}" e="{{b}}" f="{{c}}"/>',
		data: {
			a: 'foo',
		 	b: 'bar'
		},
		components: {
			c1: Ractive.extend({
				template: '{{d}}-{{e}}-{{f}}:<c2 g="{{d}}" h="{{e}}" i="{{f}}"/>',
				components: {
					c2: Ractive.extend({
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
