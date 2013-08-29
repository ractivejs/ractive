// EVENT TESTS
// ===========
//
// TODO: add moar tests

(function () {

	var fixture, testDiv, compareHTML;

	module( 'Events' );

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
	


	test( 'on-click="someEvent" fires an event when user clicks the element', function ( t ) {
		var ractive;

		expect( 2 );

		ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', function ( event ) {
			t.ok( true );
			t.equal( event.original.type, 'click' );
		});

		$( ractive.nodes.test ).trigger( 'click' );
	});

	test( 'Standard events have correct properties: node, original, keypath, context, index', function ( t ) {
		var ractive, fakeEvent;

		expect( 4 );

		ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', function ( event ) {
			t.equal( event.node, ractive.nodes.test );
			t.equal( event.keypath, '' );
			t.equal( event.context, ractive.data );
			t.equal( event.index, undefined );
		});

		$( ractive.nodes.test ).trigger( 'click' );
	});

	test( 'event.keypath is set to the innermost context', function ( t ) {
		var ractive;

		expect( 2 );

		ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}<span id="test" on-click="someEvent">click me</span>{{/foo}}',
			data: {
				foo: { bar: 'test' }
			}
		});

		ractive.on( 'someEvent', function ( event ) {
			t.equal( event.keypath, 'foo' );
			t.equal( event.context.bar, 'test' );
		});

		$( ractive.nodes.test ).trigger( 'click' );
	});

	test( 'event.index stores current indices against their references', function ( t ) {
		var ractive;

		expect( 4 );

		ractive = new Ractive({
			el: fixture,
			template: '<ul>{{#array:i}}<li id="item_{{i}}" on-click="someEvent">{{i}}: {{.}}</li>{{/array}}</ul>',
			data: {
				array: [ 'a', 'b', 'c', 'd', 'e' ]
			}
		});

		ractive.on( 'someEvent', function ( event ) {
			t.equal( event.node.innerHTML, '2: c' );
			t.equal( event.keypath, 'array.2' );
			t.equal( event.context, 'c' );
			t.deepEqual( event.index, { i: 2 })
		});

		$( ractive.nodes.item_2 ).trigger( 'click' );
	});

	test( 'event.index reports nested indices correctly', function ( t ) {
		var ractive;

		expect( 2 );

		ractive = new Ractive({
			el: fixture,
			template: '{{#foo:x}}{{#bar:y}}{{#baz:z}}<span id="test_{{x}}{{y}}{{z}}" on-click="someEvent">{{x}}{{y}}{{z}}</span>{{/baz}}{{/bar}}{{/foo}}',
			data: {
				foo: [
					{
						bar: [
							{
								baz: [ 1, 2, 3 ]
							}
						]
					}
				]
			}
		});

		t.equal( ractive.nodes.test_001.innerHTML, '001' );

		ractive.on( 'someEvent', function ( event ) {
			t.deepEqual( event.index, { x: 0, y: 0, z: 1 })
		});

		$( ractive.nodes.test_001 ).trigger( 'click' );
	});

	test( 'proxy events can have dynamic names', function ( t ) {
		var ractive, last;

		expect( 2 );

		ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="do_{{something}}">click me</span>',
			data: { something: 'foo' }
		});

		ractive.on({
			do_foo: function ( event ) {
				last = 'foo';
			},
			do_bar: function ( event ) {
				last = 'bar';
			}
		});

		$( ractive.nodes.test ).trigger( 'click' );
		t.equal( last, 'foo' );

		ractive.set( 'something', 'bar' );

		$( ractive.nodes.test ).trigger( 'click' );
		t.equal( last, 'bar' );
	});

	test( 'proxy event parameters are correctly parsed as JSON, or treated as a string', function ( t ) {
		var ractive, last;

		expect( 3 );

		ractive = new Ractive({
			el: fixture,
			template: '<span id="foo" on-click="log:one">click me</span><span id="bar" on-click=\'log:{"bar":true}\'>click me</span><span id="baz" on-click="log:[1,2,3]">click me</span>'
		});

		ractive.on({
			log: function ( event, params ) {
				last = params;
			}
		});

		$( ractive.nodes.foo ).trigger( 'click' );
		t.equal( last, 'one' );

		$( ractive.nodes.bar ).trigger( 'click' );
		t.deepEqual( last, { bar: true } );

		$( ractive.nodes.baz ).trigger( 'click' );
		t.deepEqual( last, [ 1, 2, 3 ] );
	});

	test( 'Splicing arrays correctly modifies proxy events', function ( t ) {
		var ractive;

		expect( 4 );

		ractive = new Ractive({
			el: fixture,
			template: '{{#buttons:i}}<button id="button_{{i}}" on-click="remove:{{i}}">click me</button>{{/buttons}}',
			data: { buttons: new Array(5) }
		});

		ractive.on( 'remove', function ( event, num ) {
			this.get( 'buttons' ).splice( num, 1 );
		});

		t.equal( ractive.findAll( 'button' ).length, 5 );

		$( ractive.nodes.button_2 ).trigger( 'click' );
		t.equal( ractive.findAll( 'button' ).length, 4 );

		$( ractive.nodes.button_2 ).trigger( 'click' );
		t.equal( ractive.findAll( 'button' ).length, 3 );

		$( ractive.nodes.button_2 ).trigger( 'click' );
		t.equal( ractive.findAll( 'button' ).length, 2 );
	});

	test( 'Splicing arrays correctly modifies two-way bindings', function ( t ) {
		var ractive, items;

		expect( 25 );

		items = [
			{ description: 'one' },
			{ description: 'two', done: true },
			{ description: 'three' }
		];

		ractive = new Ractive({
			el: fixture,
			template: '<ul>{{#items:i}}<li><input id="input_{{i}}" type="checkbox" checked="{{.done}}"> {{description}}</li>{{/items}}</ul>',
			data: { items: items }
		});

		// 1-3
		t.equal( ractive.nodes.input_0.checked, false );
		t.equal( ractive.nodes.input_1.checked, true );
		t.equal( ractive.nodes.input_2.checked, false );

		// 4-6
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), true );
		t.equal( !!ractive.get( 'items.2.done' ), false );

		$( ractive.nodes.input_0 ).trigger( 'click' );

		// 7-9
		t.equal( ractive.nodes.input_0.checked, true );
		t.equal( ractive.nodes.input_1.checked, true );
		t.equal( ractive.nodes.input_2.checked, false );

		// 10-12
		t.equal( !!ractive.get( 'items.0.done' ), true );
		t.equal( !!ractive.get( 'items.1.done' ), true );
		t.equal( !!ractive.get( 'items.2.done' ), false );

		items.shift();

		// 13-14
		t.equal( ractive.nodes.input_0.checked, true );
		t.equal( ractive.nodes.input_1.checked, false );

		// 15-16
		t.equal( !!ractive.get( 'items.0.done' ), true );
		t.equal( !!ractive.get( 'items.1.done' ), false );

		$( ractive.nodes.input_0 ).trigger( 'click' );

		// 17-18
		t.equal( ractive.nodes.input_0.checked, false );
		t.equal( ractive.nodes.input_1.checked, false );

		// 19-20
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), false );

		$( ractive.nodes.input_1 ).trigger( 'click' );

		// 21-22
		t.equal( ractive.nodes.input_0.checked, false );
		t.equal( ractive.nodes.input_1.checked, true );

		// 23-24
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), true );

		// 25
		t.equal( ractive.findAll( 'input' ).length, 2 );
	});

}());