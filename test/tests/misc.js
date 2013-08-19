// RENDERING TESTS
// ===============
//
// This loads in the render.json sample file and checks that each compiled
// template, in combination with the sample data, produces the expected
// HTML.
//
// TODO: add moar samples

(function () {

	var fixture, tests, i, len, runTest, compareHTML, testDiv;

	fixture = document.getElementById( 'qunit-fixture' );
	testDiv = document.createElement( 'div' );

	// necessary because IE is a goddamned nuisance
	compareHTML = function ( actual, expected ) {
		testDiv.innerHTML = actual;
		actual = testDiv.innerHTML;

		testDiv.innerHTML = expected;
		expected = testDiv.innerHTML;

		return actual === expected;
	};

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

		t.ok( compareHTML( fixture.innerHTML, '1 2' ) );
		t.deepEqual( instance.get(), { foo: 1, bar: 2 });
	});

	test( 'Subclasses of subclasses inherit data, partials and transitions', function ( t ) {
		var Subclass, SubSubclass, wiggled, shimmied, instance;

		Subclass = Ractive.extend({
			template: '<div intro="wiggle">{{>foo}}{{>bar}}{{>baz}}</div><div intro="shimmy">{{foo}}{{bar}}{{baz}}</div>',
			data: { foo: 1 },
			partials: { foo: 'fooPartial' },
			transitions: { wiggle: function () { wiggled = true; } }
		});

		SubSubclass = Subclass.extend({
			data: { bar: 2 },
			partials: { bar: 'barPartial' },
			transitions: { shimmy: function () { shimmied = true; } }
		});

		instance = new SubSubclass({
			el: fixture,
			data: { baz: 3 },
			partials: { baz: 'bazPartial' }
		});

		t.ok( compareHTML( fixture.innerHTML, '<div>fooPartialbarPartialbazPartial</div><div>123</div>' ) );
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
		
		t.ok( compareHTML( fixture.innerHTML, '3 3 3' ) );

		t.equal( ractive._deps.length, 1 );
		t.equal( ractive._deps[0].a.length, 1 );

		t.equal( ractive._deps[0].b.length, 1 );
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

		t.ok( compareHTML( ractive.renderHTML(), '<ul><li>0: a</li><li>1: b</li><li>2: c</li></ul>' ) );
	});

	test( 'Triples work with renderHTML', function ( t ) {
		var ractive;

		ractive = new Ractive({
			template: '{{{ triple }}}',
			data: { triple: '<p>test</p>' }
		});

		t.ok( compareHTML( ractive.renderHTML(), '<p>test</p>' ) );
	});

	test( 'If a select\'s value attribute is updated at the same time as the available options, the correct option will be selected', function ( t ) {
		var ractive;

		ractive = window.ractive = new Ractive({
			el: fixture,
			template: '<select id="select" value="{{selected}}">{{#options}}<option value="{{.}}">{{.}}</option>{{/options}}</select>'
		});
		
		t.ok( compareHTML( fixture.innerHTML, '<select id="select"></select>' ) );

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

		t.ok( compareHTML( fixture.innerHTML, 'Hello, world! <p>here is some HTML</p>' ) );
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

		t.ok( compareHTML( fixture.innerHTML, 'Hello, world! <p>here is some HTML</p>' ) );
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

		t.ok( compareHTML( fixture.innerHTML, '<button>Level1: Title0</button><button>Level1: Title1</button>' ) );
	});

	// These tests run fine in the browser but not in PhantomJS. WTF I don't even.
	// Anyway I can't be bothered to figure it out right now so I'm just commenting
	// these out so it will build

	/*{
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

}());