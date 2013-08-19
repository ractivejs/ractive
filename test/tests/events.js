// EVENT TESTS
// ===========
//
// TODO: add moar tests

(function () {

	var fixture, createEvent;

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
			var event = document.createEvent( 'Event' );
			event.initEvent( eventType );

			return event;
		};
	}
	


	test( 'on-click="someEvent" fires an event when user clicks the element', function ( t ) {
		var ractive, event;

		expect( 2 );

		ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', function ( event ) {
			t.ok( true );
			t.equal( event.original.type, 'click' );
		});

		event = createEvent( 'click' );

		ractive.nodes.test.dispatchEvent( event );
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

		fakeEvent = createEvent( 'click' );

		ractive.nodes.test.dispatchEvent( fakeEvent );
	});

	test( 'event.keypath is set to the innermost context', function ( t ) {
		var ractive, fakeEvent;

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

		fakeEvent = createEvent( 'click' );

		ractive.nodes.test.dispatchEvent( fakeEvent );
	});

	test( 'event.index stores current indices against their references', function ( t ) {
		var ractive, fakeEvent;

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

		fakeEvent = createEvent( 'click' );

		ractive.nodes.item_2.dispatchEvent( fakeEvent );
	});

	test( 'event.index reports nested indices correctly', function ( t ) {
		var ractive, fakeEvent;

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

		fakeEvent = createEvent( 'click' );

		ractive.nodes.test_001.dispatchEvent( fakeEvent );
	});

	test( 'proxy events can have dynamic names', function ( t ) {
		var ractive, fakeEvent, last;

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

		fakeEvent = createEvent( 'click' );
		ractive.nodes.test.dispatchEvent( fakeEvent );
		t.equal( last, 'foo' );

		ractive.set( 'something', 'bar' );

		ractive.nodes.test.dispatchEvent( fakeEvent );
		t.equal( last, 'bar' );
	});

	test( 'proxy event parameters are correctly parsed as JSON, or treated as a string', function ( t ) {
		var ractive, fakeEvent, last;

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

		fakeEvent = createEvent( 'click' );
		
		ractive.nodes.foo.dispatchEvent( fakeEvent );
		t.equal( last, 'one' );

		ractive.nodes.bar.dispatchEvent( fakeEvent );
		t.deepEqual( last, { bar: true } );

		ractive.nodes.baz.dispatchEvent( fakeEvent );
		t.deepEqual( last, [ 1, 2, 3 ] );
	});

}());