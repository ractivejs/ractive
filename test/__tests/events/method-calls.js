test( 'Calling a builtin method', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: `<button on-click='set("foo",foo+1)'>{{foo}}</button>`,
		data: { foo: 0 }
	});

	simulant.fire( ractive.find( 'button' ), 'click' );
	t.equal( ractive.get( 'foo' ), 1 );
	t.htmlEqual( fixture.innerHTML, '<button>1</button>' );
});

test( 'Calling a custom method', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: `<button on-click='activate()'>{{foo}}</button>`,
		activate: function () {
			t.ok( true );
			t.equal( this, ractive );
		}
	});

	ractive = new Widget({
		el: fixture
	});

	expect( 2 );
	simulant.fire( ractive.find( 'button' ), 'click' );
});

test( 'Calling an unknown method', function ( t ) {
	var Widget, ractive, onerror;

	Widget = Ractive.extend({
		template: `<button on-click='activate()'>{{foo}}</button>`
	});

	ractive = new Widget({
		el: fixture
	});

	// Catching errors inside handlers for programmatically-fired events
	// is a world of facepalm http://jsfiddle.net/geoz2tks/
	onerror = window.onerror;
	window.onerror = function ( err ) {
		t.ok( /Attempted to call a non-existent method \(\"activate\"\)/.test( err ) )
		return true;
	};

	simulant.fire( ractive.find( 'button' ), 'click' );
	window.onerror = onerror;
});

test( 'Passing the event object to a method', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: `<button on-click='activate(event)'>{{foo}}</button>`,
		activate: function ( event ) {
			t.equal( event.original.type, 'click' );
		}
	});

	ractive = new Widget({
		el: fixture
	});

	expect( 1 );
	simulant.fire( ractive.find( 'button' ), 'click' );
});

test( 'Passing a child of the event object to a method', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: `<button on-click='activate(event.original.type)'>{{foo}}</button>`,
		activate: function ( type ) {
			t.equal( type, 'click' );
		}
	});

	ractive = new Widget({
		el: fixture
	});

	expect( 1 );
	simulant.fire( ractive.find( 'button' ), 'click' );
});

// Bit of a cheeky workaround...
test( 'Passing a reference to this.event', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: `<button on-click='activate(.event)'>{{foo}}</button>`,
		activate: function ( event ) {
			t.equal( event, 'Christmas' );
		}
	});

	ractive = new Widget({
		el: fixture,
		data: {
			event: 'Christmas'
		}
	});

	expect( 1 );
	simulant.fire( ractive.find( 'button' ), 'click' );
});

test( 'Current event is available to method handler as this.event (#1403)', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '<button on-click="test(event)"></button>',
		test: function( event ) {
			t.equal( event, this.event );
			t.equal( ractive, this );
		}
	});

	expect( 2 );
	simulant.fire( ractive.find( 'button' ), 'click' );
});
