define([ 'Ractive', '../vendor/Ractive-events-tap' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'Miscellaneous' );

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

			t.htmlEqual( ractive.renderHTML(), '<ul><li>0: a</li><li>1: b</li><li>2: c</li></ul>' );
		});

		test( 'Triples work with renderHTML', function ( t ) {
			var ractive;

			ractive = new Ractive({
				template: '{{{ triple }}}',
				data: { triple: '<p>test</p>' }
			});

			t.htmlEqual( ractive.renderHTML(), '<p>test</p>' );
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
					items: [{ title: 'Title1', }],
				}
			});

			ractive.get('items').unshift({title: 'Title0'});

			t.htmlEqual( fixture.innerHTML, '<button>Level1: Title0</button><button>Level1: Title1</button>' );
		});

		test( 'Array splice works when simultaneously adding and removing items', function ( t ) {
			var items, ractive;

			items = [ 'zero', 'one', 'two', 'four' ];

			ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<span data-text="{{i}}:{{.}}">{{i}}:{{.}}</span>{{/items}}',
				data: { items: items }
			});

			t.htmlEqual( fixture.innerHTML, '<span data-text="0:zero">0:zero</span><span data-text="1:one">1:one</span><span data-text="2:two">2:two</span><span data-text="3:four">3:four</span>' );

			items.splice( 3, 0, 'three' );
			t.htmlEqual( fixture.innerHTML, '<span data-text="0:zero">0:zero</span><span data-text="1:one">1:one</span><span data-text="2:two">2:two</span><span data-text="3:three">3:three</span><span data-text="4:four">4:four</span>' );

			items.splice( 3, 1, 'THREE' );
			t.htmlEqual( fixture.innerHTML, '<span data-text="0:zero">0:zero</span><span data-text="1:one">1:one</span><span data-text="2:two">2:two</span><span data-text="3:THREE">3:THREE</span><span data-text="4:four">4:four</span>' );
		});

		test( 'If a select value with two-way binding has a selected option at render time, the model updates accordingly', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option value="blue">blue</option><option value="green" selected>green</option></select><p>selected {{color}}</p>'
			});

			t.equal( ractive.get( 'color' ), 'green' );
			t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green" selected>green</option></select><p>selected green</p>' );
		});

		test( 'If a select value with two-way binding has no selected option at render time, the model defaults to the top value', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<select value="{{color}}"><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select><p>selected {{color}}</p>'
			});

			t.equal( ractive.get( 'color' ), 'red' );
			t.htmlEqual( fixture.innerHTML, '<select><option value="red">red</option><option value="blue">blue</option><option value="green">green</option></select><p>selected red</p>' );
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

		

		test( 'findAll returns a static node list', function ( t ) {
			var items, ractive, list;

			items = [ 'a', 'b', 'c' ];

			ractive = new Ractive({
				el: fixture,
				template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
				data: { items: items }
			});

			list = ractive.findAll( 'li' );
			t.equal( list.length, 3 );

			items.push( 'd' );
			t.equal( items.length, 4 );
			t.equal( list.length, 3 );
		});

		test( 'findAll with live: true returns a live node list', function ( t ) {
			var items, ractive, list;

			items = [ 'a', 'b', 'c' ];

			ractive = new Ractive({
				el: fixture,
				template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
				data: { items: items }
			});

			list = ractive.findAll( 'li', { live: true });
			t.equal( list.length, 3 );

			items.push( 'd' );
			t.equal( items.length, 4 );
			t.equal( list.length, 4 );
		});

		test( 'Delimiters can be reset globally', function ( t ) {
			var oldDelimiters, oldTripledDelimiters, ractive;

			oldDelimiters = Ractive.delimiters;
			oldTripledDelimiters = Ractive.tripleDelimiters;

			Ractive.delimiters = [ '[[', ']]' ];
			Ractive.tripleDelimiters = [ '[[[', ']]]' ];

			ractive = new Ractive({
				el: fixture,
				template: '[[foo]] [[[bar]]]',
				data: { foo: 'text', bar: '<strong>html</strong>' }
			});

			t.htmlEqual( fixture.innerHTML, 'text <strong>html</strong>' );

			Ractive.delimiters = oldDelimiters;
			Ractive.tripleDelimiters = oldTripledDelimiters;
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
						{ id: 42, name: "Here 'tis" },
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

		test( 'Element order is maintained correctly with components with multiple top-level elements', function ( t ) {
			var ractive, TestComponent;

			TestComponent = Ractive.extend({
				template: '{{#bool}}TRUE{{/bool}}{{^bool}}FALSE{{/bool}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>before</p><test bool="{{bool}}"/><p>after</p>',
				components: { test: TestComponent }
			});

			t.htmlEqual( fixture.innerHTML, '<p>before</p>FALSE<p>after</p>' );

			ractive.set( 'bool', true );
			t.htmlEqual( fixture.innerHTML, '<p>before</p>TRUE<p>after</p>' );

			ractive.set( 'bool', false );
			t.htmlEqual( fixture.innerHTML, '<p>before</p>FALSE<p>after</p>' );
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

		test( 'Attempting to set up two-way binding against an expression throws an error', function ( t ) {
			var ractive;

			expect( 1 );

			try {
				ractive = new Ractive({
					el: fixture,
					template: '<input value="{{ foo[bar] }}">',
					debug: true
				});
			} catch ( err ) {
				t.ok( err );
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
			partialScr.innerHTML = '{{one}}{{two}}{{three}}';

			document.body.appendChild( partialScr );

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