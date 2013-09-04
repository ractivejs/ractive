// EVENT TESTS
// ===========
//
// TODO: add moar tests

(function () {

	var fixture, createEvent, testDiv, compareHTML;

	module( 'Events' );

	fixture = document.getElementById( 'qunit-fixture' );

	try {
		new Event( 'click' );

		createEvent = function ( eventType, params ) {
			return new Event( eventType, params );
		};
	}

	catch ( err ) {
		createEvent = function ( eventType, params ) {
			var event, args;

			event = document.createEvent( 'Event' );

			args = [
				eventType
			]

			event.initEvent( eventType );

			return event;
		};
	}


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

		simulant.fire( ractive.nodes.test, 'click' );
	});

	test( 'Standard events have correct properties: node, original, keypath, context, index', function ( t ) {
		var ractive, fakeEvent;

		expect( 5 );

		ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', function ( event ) {
			t.equal( event.node, ractive.nodes.test );
			t.equal( event.original, fakeEvent );
			t.equal( event.keypath, '' );
			t.equal( event.context, ractive.data );
			t.equal( event.index, undefined );
		});

		fakeEvent = simulant( 'click' );

		simulant.fire( ractive.nodes.test, fakeEvent );
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

		simulant.fire( ractive.nodes.test, 'click' );
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

		simulant.fire( ractive.nodes.item_2, 'click' );
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

		simulant.fire( ractive.nodes.test_001, 'click' );
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

		simulant.fire( ractive.nodes.test, 'click' );
		t.equal( last, 'foo' );

		ractive.set( 'something', 'bar' );

		simulant.fire( ractive.nodes.test, 'click' );
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

		simulant.fire( ractive.nodes.foo, 'click' );
		t.equal( last, 'one' );

		simulant.fire( ractive.nodes.bar, 'click' );
		t.deepEqual( last, { bar: true } );

		simulant.fire( ractive.nodes.baz, 'click' );
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

		simulant.fire( ractive.nodes.button_2, 'click' );
		t.equal( ractive.findAll( 'button' ).length, 4 );

		simulant.fire( ractive.nodes.button_2, 'click' );
		t.equal( ractive.findAll( 'button' ).length, 3 );

		simulant.fire( ractive.nodes.button_2, 'click' );
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

		simulant.fire( ractive.nodes.input_0, 'click' );

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

		simulant.fire( ractive.nodes.input_0, 'click' );

		// 17-18
		t.equal( ractive.nodes.input_0.checked, false );
		t.equal( ractive.nodes.input_1.checked, false );

		// 19-20
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), false );

		simulant.fire( ractive.nodes.input_1, 'click' );

		// 21-22
		t.equal( ractive.nodes.input_0.checked, false );
		t.equal( ractive.nodes.input_1.checked, true );

		// 23-24
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), true );

		// 25
		t.equal( ractive.findAll( 'input' ).length, 2 );
	});

	test( 'Mousedown followed by click results in a tap event', function ( t ) {
		var ractive, tapped;

		ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-tap="tap">tap me</span>'
		});

		ractive.on( 'tap', function () {
			tapped = true;
		});

		t.equal( tapped, undefined );
		simulant.fire( ractive.nodes.test, 'mousedown' );
		simulant.fire( ractive.nodes.test, 'click' );
		t.equal( tapped, true );
	});

	test( 'Pressing spacebar on a focused button results in a tap event', function ( t ) {
		var ractive, node, tapped;

		ractive = new Ractive({
			el: fixture,
			template: '<button id="test" on-tap="tap">tap me</button>'
		});

		node = ractive.nodes.test;

		ractive.on( 'tap', function ( event ) {
			console.log( event );
			tapped = true;
		});

		t.equal( tapped, undefined );

		simulant.fire( node, 'keydown', { which: 32 });
		t.equal( tapped, undefined );

		node.focus();
		t.equal( document.activeElement, node );
		simulant.fire( node, 'keydown', { which: 32 });
		t.equal( tapped, true );
	});

}());