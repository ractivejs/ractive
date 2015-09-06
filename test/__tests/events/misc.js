import { test } from 'qunit';
import cleanup from 'helpers/cleanup';

// TODO move these into more sensible locations

var Component, Middle, View, setup;

setup = {
	setup: function(){
		Component = Ractive.extend({
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		Middle = Ractive.extend({
			template: '<component/>'
		});

		View = Ractive.extend({
			el: fixture,
			template: '<middle/>',
			components: {
				component: Component,
				middle: Middle
			}
		});

	},
	teardown: function(){
		Component = Middle = View = void 0;
	}
};

function fired ( event ) {
	ok( true );
}

function goodEvent( event ) {
	ok( event.context || event === 'foo' );
}

function goodEventWithArg( event, arg ) {
	equal( arg || event, 'foo' );
}

function shouldNotFire () {
	throw new Error( 'This event should not fire' );
}

function notOnOriginating () {
	throw new Error( 'Namespaced event should not fire on originating component' );
}

function shouldBeNoBubbling () {
	throw new Error( 'Event bubbling should not have happened' );
}

function testEventBubbling( fire ) {

	test( 'Events bubble under "eventname", and also "component.eventname" above firing component', t => {
		var ractive, middle, component;

		expect( 3 );

		ractive = new View();
		middle = ractive.findComponent( 'middle' );
		component = ractive.findComponent( 'component' );

		component.on( 'someEvent', goodEvent );
		component.on( 'component.someEvent', notOnOriginating );

		middle.on( 'someEvent', shouldNotFire );
		middle.on( 'component.someEvent', goodEvent );

		ractive.on( 'someEvent', shouldNotFire );
		ractive.on( 'component.someEvent', goodEvent );

		fire( ractive.findComponent( 'component' ) );
	});

	test( 'arguments bubble', t => {
		var ractive, middle, component;

		expect( 3 );

		Component.prototype.template = '<span id="test" on-click="someEvent:foo">click me</span>'

		ractive = new View();
		middle = ractive.findComponent( 'middle' );
		component = ractive.findComponent( 'component' );

		component.on( 'someEvent', goodEventWithArg );
		component.on( 'component.someEvent', notOnOriginating );

		middle.on( 'someEvent', shouldNotFire );
		middle.on( 'component.someEvent', goodEventWithArg );

		ractive.on( 'someEvent', shouldNotFire );
		ractive.on( 'component.someEvent', goodEventWithArg );

		fire( ractive.findComponent( 'component' ) );
	});

	test( 'bubbling events can be stopped by returning false', t => {
		var ractive, middle, component;

		expect( 2 );

		ractive = new View();
		middle = ractive.findComponent( 'middle' );
		component = ractive.findComponent( 'component' );

		component.on( 'someEvent', goodEvent );
		component.on( 'component.someEvent', notOnOriginating );

		middle.on( 'component.someEvent', function( event ) {
			return false;
		});
		// still fires on same level
		middle.on( 'component.someEvent', goodEvent );

		ractive.on( 'component.someEvent', shouldBeNoBubbling );

		fire( ractive.findComponent( 'component' ) );
	});

	test( 'bubbling events with event object have component reference', t => {
		var ractive, middle, component;

		expect( 3 );

		ractive = new View();
		middle = ractive.findComponent( 'middle' );
		component = ractive.findComponent( 'component' );

		function hasComponentRef( event, arg ) {
			event.original ? t.equal( event.component, component ) : t.ok( true );
		}

		component.on( 'someEvent', function( event ) {
			t.ok( !event.component );
		});
		middle.on( 'component.someEvent', hasComponentRef );
		ractive.on( 'component.someEvent', hasComponentRef );

		fire( ractive.findComponent( 'component' ) );
	});

}

module( 'Component events bubbling proxy events', setup )

testEventBubbling( function ( component ) {
	simulant.fire( component.nodes.test, 'click' );
});

module( 'Component events bubbling fire() events', setup )

testEventBubbling( function ( component ) {
	component.fire( 'someEvent', 'foo' );
});


module( 'Component events', setup )

test( 'component "on-" can call methods', t => {
	var Component, component, ractive;

	expect( 2 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="foo:\'foo\'">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component on-foo="foo(1)" on-bar="bar(2)"/>',
		components: {
			component: Component
		},
		foo ( num ) {
			t.equal( num, 1 );
		},
		bar ( num ) {
			t.equal( num, 2 );
		}
	});

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );
	component.fire( 'bar', 'bar' );
});

test( 'component "on-" with ...arguments', t => {
	var Component, component, ractive;

	expect( 5 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="foo:\'foo\', 42">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component on-foo="foo(...arguments)" on-bar="bar(...arguments)"/>',
		components: {
			component: Component
		},
		foo ( e, arg1, arg2 ) {
			t.equal( e.original.type, 'click' );
			t.equal( arg1, 'foo' );
			t.equal( arg2, 42 );
		},
		bar ( arg1, arg2 ) {
			t.equal( arg1, 'bar' );
			t.equal( arg2, 100 );
		}
	});

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );
	component.fire( 'bar', 'bar', 100 );
});

test( 'component "on-" with arguments[n]', t => {
	var Component, component, ractive;

	expect( 5 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="foo:\'foo\', 42">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component on-foo="foo(arguments[2], \'qux\', arguments[0])" on-bar="bar(arguments[0], 100)"/>',
		components: {
			component: Component
		},
		foo ( arg1, arg2, arg3 ) {
			t.equal( arg1, 42 );
			t.equal( arg2, 'qux' );
			t.equal( arg3.original.type, 'click' );
		},
		bar ( arg1, arg2 ) {
			t.equal( arg1, 'bar' );
			t.equal( arg2, 100 );
		}
	});

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );
	component.fire( 'bar', 'bar' );
});

test( 'component "on-" with $n', t => {
	var Component, component, ractive;

	expect( 5 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="foo:\'foo\', 42">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component on-foo="foo($3, \'qux\', $1)" on-bar="bar($1, 100)"/>',
		components: {
			component: Component
		},
		foo ( arg1, arg2, arg3 ) {
			t.equal( arg1, 42 );
			t.equal( arg2, 'qux' );
			t.equal( arg3.original.type, 'click' );
		},
		bar ( arg1, arg2 ) {
			t.equal( arg1, 'bar' );
			t.equal( arg2, 100 );
		}
	});

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );
	component.fire( 'bar', 'bar' );
});

test( 'component "on-" supply own event proxy arguments', t => {
	t.expect( 4 );

	const Component = Ractive.extend({
		template: '<span id="test" on-click="foo:\'foo\'">click me</span>'
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<Component on-foo="foo-reproxy:1" on-bar="bar-reproxy:{{qux}}" on-bizz="bizz-reproxy"/>',
		data: {
			qux: 'qux'
		},
		components: { Component }
	});

	ractive.on( 'foo-reproxy', ( arg1, arg2 ) => {
		t.equal( arg1.original.type, 'click' );
		t.equal( arg2, 1 );
	});
	ractive.on( 'bar-reproxy', ( arg1 ) => {
		t.equal( arg1, 'qux' );
	});
	ractive.on( 'bizz-reproxy', function () {
		t.equal( arguments.length, 0 );
	});

	const component = ractive.findComponent( 'Component' );
	simulant.fire( component.nodes.test, 'click' );
	component.fire( 'bar', 'bar' );
	component.fire( 'bizz', 'buzz' );
});


test( 'component "on-" handles reproxy of arguments correctly', t => {
	expect( 4 );

	const Component = Ractive.extend({
		template: '<span id="test" on-click="foo:\'foo\'">click me</span>'
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<Component on-foo="foo-reproxy" on-bar="bar-reproxy" on-bizz="bizz-reproxy"/>',
		components: { Component }
	});

	ractive.on( 'foo-reproxy', ( e, ...args ) => {
		t.equal( e.original.type, 'click' );
		t.equal( args.length, 0 );
	});
	ractive.on( 'bar-reproxy', function () {
		t.equal( arguments.length, 0 );
	});
	ractive.on( 'bizz-reproxy', function () {
		t.equal( arguments.length, 0 );
	});

	const component = ractive.findComponent( 'Component' );
	simulant.fire( component.nodes.test, 'click' );
	component.fire( 'bar', 'bar' );
	component.fire( 'bizz' );
});

module( 'Event pattern matching' );

test( 'handlers can use pattern matching', t => {
	var ractive;

	expect( 4 );

	ractive = new Ractive({
		el: fixture,
		template: '<span id="test" on-click="some.event">click me</span>'
	});

	ractive.on( '*.*', fired);
	ractive.on( 'some.*', fired);
	ractive.on( '*.event', fired);
	ractive.on( 'some.event', fired);

	simulant.fire( ractive.nodes.test, 'click' );
});

test( 'bubbling handlers can use pattern matching', t => {
	var Component, component, ractive;

	expect( 4 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="foo">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component/>',
		components: {
			component: Component
		}
	});

	ractive.on( '*.*', fired);
	ractive.on( 'component.*', fired);
	ractive.on( '*.foo', fired);
	ractive.on( 'component.foo', fired);

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );

	// otherwise we get cross test failure due to "teardown" event
	// becasue we're reusing fixture element
	ractive.off();
});

test( 'component "on-someEvent" implicitly cancels bubbling', t => {
	var Component, component, ractive;

	expect( 1 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="someEvent">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component on-someEvent="foo"/>',
		components: {
			component: Component
		}
	});

	ractive.on( 'foo', fired);
	ractive.on( 'component.someEvent', shouldBeNoBubbling);

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );
});

test( 'component "on-" wildcards match', t => {
	var Component, component, ractive;

	expect( 3 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="foo.bar">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component on-foo.*="foo" on-*.bar="bar" on-*.*="both"/>',
		components: {
			component: Component
		}
	});

	ractive.on( 'foo', fired);
	ractive.on( 'bar', fired);
	ractive.on( 'both', fired);

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );
});

test( 'component "on-" do not get auto-namespaced events', t => {
	var Component, component, ractive;

	expect( 1 );

	Component = Ractive.extend({
		template: '<span id="test" on-click="someEvent">click me</span>'
	});

	ractive = new Ractive({
		el: fixture,
		template: '<component on-component.someEvent="foo"/>',
		components: {
			component: Component
		}
	});

	ractive.on( 'foo', shouldNotFire);

	component = ractive.findComponent( 'component' );
	simulant.fire( component.nodes.test, 'click' );
	t.ok( true );
});





module( 'Touch events' );

test( 'touch events safe to include when they don\'t exist in browser', t => {
	var ractive;

	expect( 1 );

	ractive = new Ractive({
		el: fixture,
		template: '<span id="test1" on-touchstart-touchend-touchleave-touchmove-touchcancel="foo"/>' +
			'<span id="test2" on-touchstart-mousedown="foo"/>',
		debug: true
	});

	ractive.on( 'foo', function () {
		t.ok( true );
	})

	simulant.fire( ractive.nodes.test2, 'mousedown' );

});

module( 'this.event' );

test( 'set to current event object', t => {
	var ractive;

	expect( 1 );

	ractive = new Ractive({
		el: fixture,
		template: '<span id="test" on-click="foo"/>'
	});

	ractive.on( 'foo', function ( event ) {
		t.equal( this.event, event );
	});

	simulant.fire( ractive.nodes.test, 'click' );

});

test( 'exists on ractive.fire()', t => {
	var ractive, data = { foo: 'bar' };

	expect( 2 );

	ractive = new Ractive({
		el: fixture,
		template: '<span id="test" on-click="foo"/>',
		data: data
	});

	ractive.on( 'foo', function () {
		var e;
		t.ok( e = this.event );
		t.equal( e.name, 'foo' );
	});

	ractive.fire( 'foo' );
});

test( 'wildcard and multi-part listeners have correct event name', t => {
	var ractive, fired = [], events;

	ractive = new Ractive({
		el: fixture,
		template: '<span id="test" on-click="foo"/>'
	});

	ractive.on( 'foo.* fuzzy *.bop', function () {
		fired.push( this.event.name );
	})

	events = [ 'foo.bar', 'fuzzy', 'foo.fizz', 'bip.bop' ];
	events.forEach( ractive.fire.bind( ractive ) );

	t.deepEqual( fired, events );
});


test( 'Inflight unsubscribe works (#1504)', t => {
	let ractive = new Ractive( {} );

	expect( 3 );

	function first () {
		t.ok( true );
		ractive.off( 'foo', first );
	}

	ractive.on( 'foo', first );

	ractive.on( 'foo', function () {
		t.ok( true );
	});

	ractive.fire( 'foo' );
	ractive.fire( 'foo' );
});

test( '.once() event functionality', t => {
	let ractive = new Ractive( {} );

	expect( 1 );

	ractive.once( 'foo bar', function () {
		t.ok( true );
	});

	ractive.fire( 'foo' );
	ractive.fire( 'foo' );
	ractive.fire( 'bar' );
})

test( 'method calls that fire events do not clobber this.events', t => {
	var methodEvent, ractive;

	expect( 4 );

	ractive = new Ractive({
		el: fixture,
		template: `<span id='test' on-click='inTheater()'></span>`,
		inTheater: function () {
			t.ok ( methodEvent = this.event, 'method call has event' );
			this.fire( 'yell' );
			t.equal( this.event, methodEvent, 'method event is same after firing event' );
		}
	});

	ractive.on( 'yell', function(){
		t.notEqual( this.event, methodEvent, 'handler does not have method event' );
		t.equal ( this.event.name, 'yell', 'handler as own event name' );
	})

	simulant.fire( ractive.nodes.test, 'click' );
})


module( 'Issues', { afterEach: cleanup });

asyncTest( 'Grandchild component teardown when nested in element (#1360)', t => {
	let torndown = [];

	const Child = Ractive.extend({
		template: `
			<div>
				{{#each model.items}}
					<Grandchild/>
				{{/each}}
			</div>`,
		onteardown () {
			torndown.push( this );
		}
	});

	const Grandchild = Ractive.extend({
		template: '{{title}}',
		onteardown () {
			torndown.push( this );
		}
	});

	const ractive = new Ractive({
		el: fixture,
		template: '{{#if model.show}}<Child model="{{model}}"/>{{/if}}',
		data: {
			model : {
				show: true,
				items: [
					{ title: 'one' },
					{ title: 'two' },
					{ title: 'three' }
				]
			}
		},
		components: { Child, Grandchild }
	});

	setTimeout(function() {
		ractive.set('model', {});
		t.equal( torndown.length, 4 );
		QUnit.start()
	});
});

test( 'event references in method call handler should not create a null resolver (#1438)', t => {
	let ractive = new Ractive({
		el: fixture,
		template: `{{#foo}}<button on-click="test(event.keypath + '.foo')">Click</button>{{/}}`,
		test: function() { }
	});

	ractive.set( 'foo', true );

	// NOTE: if this throws and you're testing in browser, it will probably cause a half-ton of
	// other unrelated tests to fail as well
	ractive.set( 'foo', false );

	t.htmlEqual( fixture.innerHTML, '' );
});

test( 'event actions and parameter references have context', t => {
	var ractive;

	expect( 1 );

	ractive = new Ractive({
		el: fixture,
		template: '{{#items:i}}<span id="test{{i}}" on-click="{{eventName}}:{{eventName}}"/>{{/}}',
		data: {
			items: [
				{ eventName: 'foo' },
				{ eventName: 'bar' },
				{ eventName: 'biz' }
			]
		}
	});

	ractive.on( 'bar', function ( event, parameter ) {
		t.equal( parameter, 'bar' );
	})

	simulant.fire( ractive.nodes.test1, 'click' );
});

test( 'twoway may be overridden on a per-element basis', t => {
	let ractive = new Ractive({
		el: fixture,
		template: '<input value="{{foo}}" twoway="true" />',
		data: { foo: 'test' },
		twoway: false
	});

	let node = ractive.find( 'input' );
	node.value = 'bar';
	simulant.fire( node, 'change' );
	t.equal( ractive.get( 'foo' ), 'bar' );

	ractive = new Ractive({
		el: fixture,
		template: '<input value="{{foo}}" twoway="false" />',
		data: { foo: 'test' },
		twoway: true
	});

	node = ractive.find( 'input' );
	node.value = 'bar';
	simulant.fire( node, 'change' );
	t.equal( ractive.get( 'foo' ), 'test' );
});

test( 'Presence of lazy or twoway without value is considered true', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '<input value="{{foo}}" twoway lazy/>',
		twoway: false
	});

	const input = ractive.find( 'input' );

	input.value = 'changed';

	// input events shouldn't trigger change (because lazy=true)...
	simulant.fire( input, 'input' );
	t.equal( ractive.get( 'foo' ), '' );

	// ...but change events still should (because twoway=true)
	simulant.fire( input, 'change' );
	t.equal( ractive.get( 'foo' ), 'changed' );
});

test( '`lazy=0` is not mistaken for `lazy`', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '<input value="{{foo}}" lazy="0"/>'
	});

	const input = ractive.find( 'input' );

	input.value = 'changed';

	// input events should trigger change
	simulant.fire( input, 'input' );
	t.equal( ractive.get( 'foo' ), 'changed' );
});

test( '`twoway=0` is not mistaken for `twoway`', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '<input value="{{foo}}" twoway="0"/>'
	});

	const input = ractive.find( 'input' );

	input.value = 'changed';

	simulant.fire( input, 'input' );
	t.equal( ractive.get( 'foo' ), undefined );

	simulant.fire( input, 'change' );
	t.equal( ractive.get( 'foo' ), undefined );
});

test( 'Attribute directives on fragments that get re-used (partials) should stick around for re-use', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '{{#list}}{{>partial}}{{/}}',
		partials: {
			partial: '<input value="{{.foo}}" twoway="false" />'
		},
		data: { list: [ { foo: 'a' }, { foo: 'b' } ] },
		twoway: true
	});

	// this should have no effect
	const inputs = ractive.findAll( 'input' );
	inputs[0].value = 'c';
	inputs[1].value = 'c';
	simulant.fire( inputs[0], 'change' );
	simulant.fire( inputs[1], 'change' );

	t.equal( ractive.get( 'list.0.foo' ), 'a' );
	t.equal( ractive.get( 'list.1.foo' ), 'b' );
});

test( 'Regression test for #2046', t => {
	expect( 1 );

	let ractive = new Ractive({
		el: fixture,
		template: '<button on-click="onClick(eventName)">{{eventName}}</button>',
		data: { eventName: 'foo' },
		onClick: function ( eventName ) {
			t.equal( eventName, 'foo' );
		}
	}), el;

	// this should have no effect
	el = ractive.find('button');
	simulant.fire( el, 'click' );
});

test( 'Regression test for #1971', t => {
	expect( 1 );

	let ractive = new Ractive({
		el: fixture,
		template: '<Button buttonName="{{foo}}"></Button>',
		data: { foo: 'foo' },
		components: {
			Button: Ractive.extend({
				template: '<button on-click="onClick(event)"></button>',
				onClick: function ( event ) {
					t.deepEqual( event.context, { buttonName: 'foo' } );
				}
			})
		}
	}), el;

	// this should have no effect
	el = ractive.find('button');
	simulant.fire( el, 'click' );
});

test( 'correct function scope for this.bar() in template', t => {
	let ractive = new Ractive({
		el: fixture,
		template: `
			<button on-click='set("foo",bar())'>click me</button>
			<p>foo: {{foo}}</p>
		`,
		data: {
			foo: 'nope',
			bar: function () {
				return this.get( 'answer' );
			},
			answer: 42
		}
	});

	simulant.fire( ractive.find( 'button' ), 'click' );

	t.equal( ractive.get( 'foo' ), '42' );
});

// phantom and IE8 don't like these tests, but browsers are ok with them
try {
	simulant.fire( document.createElement( 'div' ), 'input' );
	simulant.fire( document.createElement( 'div' ), 'blur' );

	test( 'lazy may be overridden on a per-element basis', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" lazy="true" />',
			data: { foo: 'test' },
			lazy: false
		});

		let node = ractive.find( 'input' );
		node.value = 'bar';
		simulant.fire( node, 'input' );
		t.equal( ractive.get( 'foo' ), 'test' );
		simulant.fire( node, 'blur' );
		t.equal( ractive.get( 'foo' ), 'bar' );

		ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" lazy="false" />',
			data: { foo: 'test' },
			lazy: true
		});

		node = ractive.find( 'input' );
		node.value = 'bar';
		simulant.fire( node, 'input' );
		t.equal( ractive.get( 'foo' ), 'bar' );
	});

	asyncTest( 'lazy may be set to a number to trigger on a timeout', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo}}" lazy="50" />',
			data: { foo: 'test' }
		});

		let node = ractive.find( 'input' );
		node.value = 'bar';
		simulant.fire( node, 'input' );
		t.equal( ractive.get( 'foo' ), 'test' );

		setTimeout( () => {
			t.equal( ractive.get( 'foo' ), 'test' );
		}, 5 );

		setTimeout( () => {
			t.equal( ractive.get( 'foo' ), 'bar' );
			QUnit.start();
		}, 60 );
	});

	test( '{{else}} blocks work in event names (#1598)', t => {
		let ractive, button, event1Fired, event2Fired;

		ractive = new Ractive({
			el: fixture,
			template: '<button on-click="{{#if foo}}event1{{else}}event2{{/if}}"></button>',
			data: {
				foo: true
			}
		});

		ractive.on({
			event1: () => event1Fired = true,
			event2: () => event2Fired = true
		});

		button = ractive.find( 'button' );

		simulant.fire( button, 'click' );
		t.ok( event1Fired );
		t.ok( !event2Fired );

		event1Fired = false;
		ractive.set( 'foo', false );
		simulant.fire( button, 'click' );
		t.ok( !event1Fired );
		t.ok( event2Fired );
	});

	test( 'invalid content in method call event directive should have a reasonable error message', t => {
		t.throws(() => {
			new Ractive({
				el: fixture,
				template: '<button on-click="alert(foo);">Click Me</button>'
			});
		}, /invalid input/i );
	});
} catch ( err ) {}
