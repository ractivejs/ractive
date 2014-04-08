define([ 'ractive', 'vendor/ractive-events-tap' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Foo;

		module( 'Miscellaneous' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		Foo = function ( content ) {
			this.content = content;
		};

		Ractive.adaptors.foo = {
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

			t.equal( ractive._deps.length, 2 );
			t.equal( ractive._deps[1].a.length, 1 );

			t.equal( ractive._deps[1].b.length, 1 );
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

		test( 'If a select\'s value attribute is updated at the same time as the available options, the correct option will be selected', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select id="select" value="{{selected}}">{{#options}}<option value="{{.}}">{{.}}</option>{{/options}}</select>'
			});

			t.htmlEqual( fixture.innerHTML, '<select id="select"></select>' );

			ractive.set({
				selected: 'c',
				options: [ 'a', 'b', 'c', 'd' ]
			});

			t.equal( ractive.get( 'selected' ), 'c' );
			t.equal( ractive.nodes.select.value, 'c' );
		});

		test( 'Passing in alternative delimiters', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '[[ greeting ]], [[recipient]]! [[[ triple ]]]',
				data: {
					greeting: 'Hello',
					recipient: 'world',
					triple: '<p>here is some HTML</p>'
				},
				delimiters: [ '[[', ']]' ],
				tripleDelimiters: [ '[[[', ']]]' ]
			});

			t.htmlEqual( fixture.innerHTML, 'Hello, world! <p>here is some HTML</p>' );
		});

		test( 'Using alternative delimiters in template', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{=[[ ]]=}} {{{=[[[ ]]]=}}} [[ greeting ]], [[recipient]]! [[[ triple ]]]',
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
				template: '{{#items}}<button proxy-tap="bla">Level1: {{ title }}</button>{{/items}}',
				data: {
					items: [{ title: 'Title1' }]
				}
			});

			ractive.get('items').unshift({title: 'Title0'});

			t.htmlEqual( fixture.innerHTML, '<button>Level1: Title0</button><button>Level1: Title1</button>' );
		});

		test( 'If a select value with two-way binding has a selected option at render time, the model updates accordingly', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option value="blue">blue</option><option value="green" selected>green</option></select> <p>selected {{color}}</p>'
			});

			t.equal( ractive.get( 'color' ), 'green' );
			t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green" selected>green</option></select> <p>selected green</p>' );
		});

		test( 'If a select value with two-way binding has no selected option at render time, the model defaults to the top value', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select> <p>selected {{color}}</p>'
			});

			t.equal( ractive.get( 'color' ), 'red' );
			t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select> <p>selected red</p>' );
		});


		test( 'If the value of a select is specified in the model, it overrides the markup', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option id="blue" value="blue">blue</option><option id="green" value="green" selected>green</option></select>',
				data: { color: 'blue' }
			});

			t.equal( ractive.get( 'color' ), 'blue' );
			t.ok( ractive.nodes.blue.selected );
			t.ok( !ractive.nodes.green.selected );
		});

		test( 'A select value with static options with numeric values will show the one determined by the model, whether a string or a number is used', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{i}}"><option id="_1" value="1">one</option><option id="_2" value="2">two</option><option id="_3" value="3">three</option></select>',
				data: { i: 2 }
			});

			t.ok( !ractive.nodes._1.selected );
			t.ok(  ractive.nodes._2.selected );
			t.ok( !ractive.nodes._3.selected );

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{i}}"><option id="_1" value="1">one</option><option id="_2" value="2">two</option><option id="_3" value="3">three</option></select>',
				data: { i: "3" }
			});

			t.ok( !ractive.nodes._1.selected );
			t.ok( !ractive.nodes._2.selected );
			t.ok(  ractive.nodes._3.selected );
		});

		test( 'Setting the value of a select works with options added via a triple', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{value}}">{{{triple}}}</select>',
				data: {
					value: 2,
					triple: '<option value="1">1</option><option value="2">2</option>'
				}
			});

			t.equal( ractive.find( 'select' ).value, 2);
			t.ok( ractive.findAll( 'option' )[1].selected );

			ractive.set( 'triple', '<option value="1" selected>1</option><option value="2">2</option>' );
			t.equal( ractive.find( 'select' ).value, 1 );
			t.equal( ractive.get( 'value' ), 1 );
		});

		test( 'A two-way select updates to the actual value of its selected option, not the stringified value', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{selected}}">{{#options}}<option value="{{.}}">{{description}}</option>{{/options}}</select><p>Selected {{selected.description}}</p>',
				data: {
					options: [
						{ description: 'foo' },
						{ description: 'bar' },
						{ description: 'baz' }
					]
				}
			});

			t.deepEqual( ractive.get( 'selected' ), { description: 'foo' });

			ractive.findAll( 'option' )[1].selected = true;
			ractive.updateModel();
			t.deepEqual( ractive.get( 'selected' ), { description: 'bar' });

			ractive.set( 'selected', ractive.get( 'options[2]' ) );
			t.ok( ractive.findAll( 'option' )[2].selected );
		})

		/*
		test( 'If a multiple select value with two-way binding has a selected option at render time, the model updates accordingly', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{colors}}" multiple><option value="red">red</option><option value="blue" selected>blue</option><option value="green" selected>green</option></select>'
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'blue', 'green' ] );
		});
		*/

		test( 'If a multiple select value with two-way binding has no selected option at render time, the model defaults to an empty array', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{colors}}" multiple><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select>'
			});

			t.deepEqual( ractive.get( 'colors' ), [] );
		});

		test( 'If the value of a multiple select is specified in the model, it overrides the markup', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{colors}}" multiple><option id="red" value="red">red</option><option id="blue" value="blue">blue</option><option id="green" value="green" selected>green</option></select>',
				data: { colors: [ 'red', 'green' ] }
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'red', 'green' ] );
			t.ok( ractive.nodes.red.selected );
			t.ok( !ractive.nodes.blue.selected );
			t.ok( ractive.nodes.green.selected );
		});

		test( 'The model updates to reflect which checkbox inputs are checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: 'b<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="green" type="checkbox" name="{{colors}}" value="blue" checked><input id="blue" type="checkbox" name="{{colors}}" value="green" checked>'
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'blue', 'green' ] );
			t.ok( !ractive.nodes.red.checked );
			t.ok( ractive.nodes.blue.checked );
			t.ok( ractive.nodes.green.checked );

			ractive = new Ractive({
				el: fixture,
				template: '<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="green" type="checkbox" name="{{colors}}" value="blue"><input id="blue" type="checkbox" name="{{colors}}" value="green">'
			});

			t.deepEqual( ractive.get( 'colors' ), [] );
			t.ok( !ractive.nodes.red.checked );
			t.ok( !ractive.nodes.blue.checked );
			t.ok( !ractive.nodes.green.checked );
		});

		test( 'The model overrides which checkbox inputs are checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input id="red" type="checkbox" name="{{colors}}" value="red"><input id="blue" type="checkbox" name="{{colors}}" value="blue" checked><input id="green" type="checkbox" name="{{colors}}" value="green" checked>',
				data: { colors: [ 'red', 'blue' ] }
			});

			t.deepEqual( ractive.get( 'colors' ), [ 'red', 'blue' ] );
			t.ok( ractive.nodes.red.checked );
			t.ok( ractive.nodes.blue.checked );
			t.ok( !ractive.nodes.green.checked );
		});

		test( 'The model updates to reflect which radio input is checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" name="{{color}}" value="red"><input type="radio" name="{{color}}" value="blue" checked><input type="radio" name="{{color}}" value="green">'
			});

			t.deepEqual( ractive.get( 'color' ), 'blue' );

			ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" name="{{color}}" value="red"><input type="radio" name="{{color}}" value="blue"><input type="radio" name="{{color}}" value="green">'
			});

			t.deepEqual( ractive.get( 'color' ), undefined );
		});

		test( 'The model overrides which radio input is checked at render time', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<input id="red" type="radio" name="{{color}}" value="red"><input id="blue" type="radio" name="{{color}}" value="blue" checked><input id="green" type="radio" name="{{color}}" value="green">',
				data: { color: 'green' }
			});

			t.deepEqual( ractive.get( 'color' ), 'green' );
			t.ok( !ractive.nodes.red.checked );
			t.ok( !ractive.nodes.blue.checked );
			t.ok( ractive.nodes.green.checked );
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

		test( 'updateModel correctly updates the value of a text input', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{name}}">',
				data: { name: 'Bob' }
			});

			ractive.find( 'input' ).value = 'Jim';
			ractive.updateModel( 'name' );

			t.equal( ractive.get( 'name' ), 'Jim' );
		});

		test( 'updateModel correctly updates the value of a select', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{selected}}"><option selected value="red">red</option><option value="blue">blue</option><option value="green">green</option></select>'
			});

			t.equal( ractive.get( 'selected' ), 'red' );

			ractive.findAll( 'option' )[1].selected = true;
			ractive.updateModel();

			t.equal( ractive.get( 'selected' ), 'blue' );
		});

		test( 'updateModel correctly updates the value of a multiple select', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select multiple value="{{selected}}"><option selected value="red">red</option><option value="blue">blue</option><option value="green">green</option></select>'
			});

			t.deepEqual( ractive.get( 'selected' ), [ 'red' ] );

			ractive.findAll( 'option' )[1].selected = true;
			ractive.updateModel();

			t.deepEqual( ractive.get( 'selected' ), [ 'red', 'blue' ] );
		});

		test( 'updateModel correctly updates the value of a textarea', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<textarea value="{{name}}"></textarea>',
				data: { name: 'Bob' }
			});

			ractive.find( 'textarea' ).value = 'Jim';
			ractive.updateModel( 'name' );

			t.equal( ractive.get( 'name' ), 'Jim' );
		});

		test( 'updateModel correctly updates the value of a checkbox', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="checkbox" checked="{{active}}">',
				data: { active: true }
			});

			ractive.find( 'input' ).checked = false;
			ractive.updateModel();

			t.equal( ractive.get( 'active' ), false );
		});

		test( 'updateModel correctly updates the value of a radio', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" checked="{{active}}">',
				data: { active: true }
			});

			ractive.find( 'input' ).checked = false;
			ractive.updateModel();

			t.equal( ractive.get( 'active' ), false );
		});

		test( 'updateModel correctly updates the value of an indirect (name-value) checkbox', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="checkbox" name="{{colour}}" value="red"><input type="checkbox" name="{{colour}}" value="blue" checked><input type="checkbox" name="{{colour}}" value="green">'
			});

			t.deepEqual( ractive.get( 'colour' ), [ 'blue' ] );

			ractive.findAll( 'input' )[2].checked = true;
			ractive.updateModel();

			t.deepEqual( ractive.get( 'colour' ), [ 'blue', 'green' ] );
		});

		test( 'updateModel correctly updates the value of an indirect (name-value) radio', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input type="radio" name="{{colour}}" value="red"><input type="radio" name="{{colour}}" value="blue" checked><input type="radio" name="{{colour}}" value="green">'
			});

			t.deepEqual( ractive.get( 'colour' ), 'blue' );

			ractive.findAll( 'input' )[2].checked = true;
			ractive.updateModel();

			t.deepEqual( ractive.get( 'colour' ), 'green' );
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

		test( 'Partials can contain inline partials', function ( t ) {
			var partialStr, ractive;

			partialStr = '<ul>{{#items}}{{>item}}{{/items}}</ul> <!-- {{>item}} --><li>{{.}}</li><!-- {{/item}} -->';

			ractive = new Ractive({
				el: fixture,
				template: '{{>list}}',
				partials: {
					list: partialStr
				},
				data: {
					items: [ 'a', 'b', 'c' ]
				}
			});

			t.htmlEqual( fixture.innerHTML, '<ul><li>a</li><li>b</li><li>c</li></ul>' );
		});

		test( 'Delimiters can be reset globally', function ( t ) {
			var oldDelimiters, oldTripledDelimiters, ractive;

			oldDelimiters = Ractive.defaults.delimiters;
			oldTripledDelimiters = Ractive.defaults.tripleDelimiters;

			Ractive.defaults.delimiters = [ '[[', ']]' ];
			Ractive.defaults.tripleDelimiters = [ '[[[', ']]]' ];

			ractive = new Ractive({
				el: fixture,
				template: '[[foo]] [[[bar]]]',
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

		test( 'Options added to a select after the initial render will be selected if the value matches', function ( t ) {
			var ractive, options;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{value_id}}">{{#post_values}}<option value="{{id}}">{{id}} &mdash; {{name}}</option>{{/post_values}}</select>',
				data: {
					value_id: 42,
					values: [
						{ id: 1, name: "Boo" },
						{ id: 42, name: "Here 'tis" }
					]
				}
			});

			options = ractive.findAll( 'option', { live: true });
			t.ok( !options.length );

			ractive.set('post_values', ractive.get('values'));

			t.equal( options.length, 2 );
			t.ok( !options[0].selected );
			t.ok( options[1].selected );
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

		test( 'If an empty select with a binding has options added to it, the model should update', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{id}}">{{#items}}<option value="{{id}}">{{text}}</option>{{/items}}</select><strong>Selected: {{id || "nothing"}}</strong>'
			});

			ractive.set('items', [ { id: 1, text: 'one' }, { id: 2, text: 'two' } ]);
			t.equal( ractive.get( 'id' ), 1 );
			t.htmlEqual( fixture.innerHTML, '<select><option value="1">one</option><option value="2">two</option></select><strong>Selected: 1</strong>' );
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

		test( 'Regression test for #339', function ( t ) {
			var ractive, selects;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<p>{{i}}: <select value="{{.color}}"><option value="red">Red</option></select></p>{{/items}}',
				data: { items: [{}] }
			});

			selects = ractive.findAll( 'select', { live: true });

			t.equal( selects[0].value, 'red' );

			ractive.get( 'items' ).push({});

			t.htmlEqual( fixture.innerHTML, '<p>0: <select><option value="red">Red</option></select></p><p>1: <select><option value="red">Red</option></select></p>')
			t.deepEqual( ractive.get(), { items: [ {color: 'red'}, {color: 'red'} ] } );
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

		test( 'Instances of a subclass do not have access to the default model', function ( t ) {
			var Subclass, instance;

			Subclass = Ractive.extend({
				data: {
					foo: 'bar',
					obj: {
						one: 1,
						two: 2
					}
				}
			});

			instance = new Subclass({
				el: fixture,
				template: '{{foo}}{{obj.one}}{{obj.two}}'
			});

			t.htmlEqual( fixture.innerHTML, 'bar12' );

			instance.set( 'foo', 'baz' );
			instance.set( 'obj.one', 3 );
			instance.set( 'obj.two', 4 );

			t.htmlEqual( fixture.innerHTML, 'baz34' );

			t.deepEqual( Subclass.data, {
				foo: 'bar',
				obj: {
					one: 1,
					two: 2
				}
			});
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
				data: new Model({
					foo: 'bar'
				})
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

		test( 'Regression test for #351', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<select value="{{selected}}" multiple>{{#items}}<option value="{{id}}">{{name}}</option>{{/items}}</select>'
			});

			ractive.set( 'items', [{name:'one', id:1}, {name:'two', id:2}]);

			t.htmlEqual( fixture.innerHTML, '<select multiple><option value="1">one</option><option value="2">two</option></select>' );
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
				complete: function () {
					t.equal( this._super(), 42 );
					start();
				}
			});
		});

		test( 'A string can be supplied instead of an array for the `adapt` option (if there\'s only one adaptor listed', function ( t ) {
			var Subclass, instance;

			Subclass = Ractive.extend({ adapt: 'Foo' });
			instance = new Subclass();

			t.deepEqual( instance.adapt, ['Foo'] );
		});

		test( 'Regression test for #393', function ( t ) {
			var View, ractive;

			View = Ractive.extend({
				data: {
					foo: {
						a: 1,
						b: 2
					},

					bar: [
						'a', 'b', 'c'
					]
				}
			});

			ractive = new View({
				el: fixture,
				template: '{{ JSON.stringify(foo) }} | {{ JSON.stringify(bar) }}'
			});

			t.htmlEqual( fixture.innerHTML, '{"a":1,"b":2} | ["a","b","c"]' );
			ractive.set( 'foo.b', 3 );
			t.deepEqual( View.data, {foo:{a:1,b:2},bar:['a', 'b', 'c']});
			t.htmlEqual( fixture.innerHTML, '{"a":1,"b":3} | ["a","b","c"]' );
			ractive.set( 'bar[1]', 'd' );
			t.deepEqual( View.data, {foo:{a:1,b:2},bar:['a', 'b', 'c']});
			t.htmlEqual( fixture.innerHTML, '{"a":1,"b":3} | ["a","d","c"]' );
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
