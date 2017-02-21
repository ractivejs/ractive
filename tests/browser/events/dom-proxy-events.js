import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'events/dom-proxy-events.js' );

	test( 'on-click="someEvent" fires an event when user clicks the element', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', ( event ) => {
			t.ok( true );
			t.equal( event.original.type, 'click' );
		});

		fire( ractive.find( '#test' ), 'click' );
	});

	test( 'empty event on-click="" ok', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="">click me</span>'
		});

		fire( ractive.find( '#test' ), 'click' );
	});

	test( 'on-click="someEvent" does not fire event when unrendered', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', () => {
			throw new Error( 'Event handler called after unrender' );
		});

		const node = ractive.find( '#test' );

		ractive.unrender();
		fire( node, 'click' );
	});

	test( 'Standard events have correct properties: node, original, name', t => {
		t.expect( 3 );

		const ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', ( event ) => {
			t.equal( event.node, ractive.find( '#test ' ));
			t.equal( event.name, 'someEvent' );
			t.ok( event.original );
		});

		fire( ractive.find( '#test' ), 'click' );
	});

	test( 'preventDefault and stopPropagation if event handler returned false', t => {
		t.expect( 9 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				<span id="return_false" on-click="returnFalse">click me</span>
				<span id="return_undefined" on-click="returnUndefined">click me</span>
				<span id="return_zero" on-click="returnZero">click me</span>
				<span id="multiHandler" on-click="multiHandler">click me</span>`
		});

		let preventedDefault = false;
		let stoppedPropagation = false;

		function mockOriginalEvent ( original ) {
			preventedDefault = stoppedPropagation = false;
			original.preventDefault = () => preventedDefault = true;
			original.stopPropagation = () => stoppedPropagation = true;
		}

		ractive.on( 'returnFalse', event => {
			t.ok( true );
			mockOriginalEvent( event.original );
			return false;
		});

		ractive.on( 'returnUndefined', event => {
			t.ok( true );
			mockOriginalEvent( event.original );
		});

		ractive.on( 'returnZero', event => {
			t.ok( true );
			mockOriginalEvent( event.original );
			return 0;
		});

		ractive.on( 'multiHandler', event => {
			t.ok( true );
			mockOriginalEvent( event.original );
			return false;
		});

		ractive.on( 'multiHandler', event => {
			t.ok( true );
			mockOriginalEvent( event.original );
			return 0;
		});

		fire( ractive.find( '#return_false' ), 'click' );
		t.ok( preventedDefault && stoppedPropagation );

		fire( ractive.find( '#return_undefined' ), 'click' );
		t.ok( !preventedDefault && !stoppedPropagation );

		fire( ractive.find( '#return_zero' ), 'click' );
		t.ok( !preventedDefault && !stoppedPropagation );

		fire( ractive.find( '#multiHandler' ), 'click' );
		t.ok( preventedDefault && stoppedPropagation );
	});

	test( 'event keypath is set to the innermost context', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}<span id="test" on-click="someEvent">click me</span>{{/foo}}',
			data: {
				foo: { bar: 'test' }
			}
		});

		ractive.on( 'someEvent', ( event ) => {
			t.equal( event.resolve(), 'foo' );
			t.equal( event.get( '.bar' ), 'test' );
		});

		fire( ractive.find( '#test' ), 'click' );
	});

	test( 'event keypath is set to the mapped keypath in a component', t => {
		t.expect( 4 );

		const cmp = Ractive.extend({
			template: '{{#with baz}}<span id="test" on-click="someEvent">click me</span>{{/with}}<cmp2 oof="{{baz}}" />',
			isolated: false
		});
		const cmp2 = Ractive.extend({
			template: '{{#with oof}}<span id="test2" on-click="someEvent">click me</span>{{/with}}',
			isolated: false
		});
		const ractive = new Ractive({
			el: fixture,
			template: '<cmp baz="{{foo}}" />',
			data: {
				foo: { bar: 'test' }
			},
			components: { cmp, cmp2 }
		});

		ractive.on( 'cmp.someEvent', ( event ) => {
			t.equal( event.resolve(), 'baz' );
			t.equal( event.get( '.bar' ), 'test' );
		});
		ractive.on( 'cmp2.someEvent', ( event ) => {
			t.equal( event.resolve(), 'oof' );
			t.equal( event.get( '.bar' ), 'test' );
		});

		fire( ractive.find( '#test' ), 'click' );
		fire( ractive.find( '#test2' ), 'click' );
	});

	test( 'event rootpath is set to the non-mapped keypath in a component', t => {
		t.expect( 4 );

		const cmp = Ractive.extend({
			template: '{{#with baz}}<span id="test" on-click="someEvent">click me</span>{{/with}}<cmp2 oof="{{baz}}" />',
			isolated: false
		});
		const cmp2 = Ractive.extend({
			template: '{{#with oof}}<span id="test2" on-click="someEvent">click me</span>{{/with}}',
			isolated: false
		});
		const ractive = new Ractive({
			el: fixture,
			template: '<cmp baz="{{foo}}" />',
			data: {
				foo: { bar: 'test' }
			},
			components: { cmp, cmp2 }
		});

		ractive.on( 'cmp.someEvent', function ( event ) {
			t.equal( event.resolve( this ), 'foo' );
			t.equal( event.get( '.bar' ), 'test' );
		});
		ractive.on( 'cmp2.someEvent', function ( event ) {
			t.equal( event.resolve( this ), 'foo' );
			t.equal( event.get( '.bar' ), 'test' );
		});

		fire( ractive.find( '#test' ), 'click' );
		fire( ractive.find( '#test2' ), 'click' );
	});

	test( 'events can correctly retrieve index refs', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: '<ul>{{#array:i}}<li id="item_{{i}}" on-click="someEvent">{{i}}: {{.}}</li>{{/array}}</ul>',
			data: {
				array: [ 'a', 'b', 'c', 'd', 'e' ]
			}
		});

		ractive.on( 'someEvent', ( event ) => {
			t.equal( event.node.innerHTML, '2: c' );
			t.equal( event.resolve(), 'array.2' );
			t.equal( event.get(), 'c' );
			t.equal( event.get( 'i' ), 2 );
		});

		fire( ractive.find( '#item_2' ), 'click' );
	});

	test( 'events can correctly retrieve nested index refs', t => {
		t.expect( 4 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo:x}}{{#bar:y}}{{#baz:z}}<span id="test_{{x}}{{y}}{{z}}" on-click="someEvent">{{x}}{{y}}{{z}}</span>{{/baz}}{{/bar}}{{/foo}}',
			data: {
				foo: [{
					bar: [{ baz: [ 1, 2, 3 ] }]
				}]
			}
		});

		t.equal( ractive.find( '#test_001' ).innerHTML, '001' );

		ractive.on( 'someEvent', ( event ) => {
			t.equal( event.get( 'x' ), 0 );
			t.equal( event.get( 'y' ), 0 );
			t.equal( event.get( 'z' ), 1 );
		});

		fire( ractive.find( '#test_001' ), 'click' );
	});

	test( 'Splicing arrays correctly modifies two-way bindings', t => {
		t.expect( 25 );

		const items = [
			{ description: 'one' },
			{ description: 'two', done: true },
			{ description: 'three' }
		];

		const ractive = new Ractive({
			el: fixture,
			template: `
				<ul>
					{{#items:i}}
						<li>
							<input id="input_{{i}}" type="checkbox" checked="{{.done}}">
							{{description}}
						</li>
					{{/items}}
				</ul>`,
			data: { items }
		});

		// 1-3
		t.equal( ractive.find( '#input_0' ).checked, false );
		t.equal( ractive.find( '#input_1' ).checked, true );
		t.equal( ractive.find( '#input_2' ).checked, false );

		// 4-6
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), true );
		t.equal( !!ractive.get( 'items.2.done' ), false );

		fire( ractive.find( '#input_0' ), 'click' );

		// 7-9
		t.equal( ractive.find( '#input_0' ).checked, true );
		t.equal( ractive.find( '#input_1' ).checked, true );
		t.equal( ractive.find( '#input_2' ).checked, false );

		// 10-12
		t.equal( !!ractive.get( 'items.0.done' ), true );
		t.equal( !!ractive.get( 'items.1.done' ), true );
		t.equal( !!ractive.get( 'items.2.done' ), false );

		ractive.shift('items');

		// 13-14
		t.equal( ractive.find( '#input_0' ).checked, true );
		t.equal( ractive.find( '#input_1' ).checked, false );

		// 15-16
		t.equal( !!ractive.get( 'items.0.done' ), true );
		t.equal( !!ractive.get( 'items.1.done' ), false );

		fire( ractive.find( '#input_0' ), 'click' );

		// 17-18
		t.equal( ractive.find( '#input_0' ).checked, false );
		t.equal( ractive.find( '#input_1' ).checked, false );

		// 19-20
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), false );

		fire( ractive.find( '#input_1' ), 'click' );

		// 21-22
		t.equal( ractive.find( '#input_0' ).checked, false );
		t.equal( ractive.find( '#input_1' ).checked, true );

		// 23-24
		t.equal( !!ractive.get( 'items.0.done' ), false );
		t.equal( !!ractive.get( 'items.1.done' ), true );

		// 25
		t.equal( ractive.findAll( 'input' ).length, 2 );
	});

	test( 'Changes triggered by two-way bindings propagate properly (#460)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#items}}
					<label>
						<input type="checkbox" checked="{{completed}}"> {{description}}
					</label>
				{{/items}}

				<p class="result">
					{{ items.filter( completed ).length }}
				</p>

				{{#if items.filter( completed ).length}}
					<p class="conditional">foo</p>
				{{/if}}`,
			data: {
				items: [
					{ completed: true, description: 'fix this bug' },
					{ completed: false, description: 'fix other bugs' },
					{ completed: false, description: 'housework' }
				],
				completed ( item ) {
					return !!item.completed;
				}
			}
		});

		const changes = {};

		ractive.observeOnce( '**', ( c, o, k ) => {
			changes[k] = c;
		});

		t.htmlEqual( ractive.find( '.result' ).innerHTML, '1' );

		fire( ractive.findAll( 'input' )[1], 'click' );
		t.htmlEqual( ractive.find( '.result' ).innerHTML, '2' );

		t.equal( changes[ 'items.1.completed' ], true );

		fire( ractive.findAll( 'input' )[0], 'click' );
		fire( ractive.findAll( 'input' )[1], 'click' );
		t.htmlEqual( ractive.find( '.result' ).innerHTML, '0' );
	});

	test( 'Multiple events can share the same directive', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div on-click-mouseover="foo"></div>'
		});

		let count = 0;

		ractive.on( 'foo', () => {
			count += 1;
		});

		fire( ractive.find( 'div' ), 'click' );
		t.equal( count, 1 );

		fire( ractive.find( 'div' ), 'mouseover' );
		t.equal( count, 2 );
	});

	test( 'Superfluous whitespace is ignored', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<div class="one" on-click=" foo "></div><div class="two" {{#bar}}on-click=" bar "{{/}}></div>'
		});

		let fooCount = 0;
		let barCount = 0;

		ractive.on({
			foo () {
				fooCount += 1;
			},
			bar () {
				barCount += 1;
			}
		});

		fire( ractive.find( '.one' ), 'click' );
		t.equal( fooCount, 1 );

		fire( ractive.find( '.two' ), 'click' );
		t.equal( barCount, 0 );

		ractive.set( 'bar', true );
		fire( ractive.find( '.two' ), 'click' );
		t.equal( barCount, 1 );
	});

	test( '@index can be used in proxy event directives', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each letters}}
					<button class="method" on-click="@this.select(@index)"></button>
				{{/each}}`,
			data: { letters: [ 'a', 'b', 'c' ] }
		});

		ractive.select = ( idx ) => t.equal( idx, 1 );

		fire( ractive.findAll( 'button[class=method]' )[1], 'click' );

		ractive.splice( 'letters', 0, 1 );
		ractive.splice( 'letters', 1, 0, 'a' );
		fire( ractive.findAll( 'button[class=method]' )[1], 'click' );
	});

	test( 'component "on-" supply own event proxy arguments (but original args are tacked on)', t => {
		t.expect( 5 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="@this.fire("foo", event, "foo")">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="@this.fire("foo-reproxy", event, 1)" on-bar="@this.fire("bar-reproxy", "qux")" on-bizz="bizz-reproxy"/>',
			data: {
				qux: 'qux'
			},
			components: { Component }
		});

		ractive.on( 'foo-reproxy', ( ctx, arg1 ) => {
			t.equal( ctx.original.type, 'click' );
			t.equal( arg1, 1 );
		});
		ractive.on( 'bar-reproxy', ( ctx, arg1 ) => {
			t.equal( arg1, 'qux' );
		});
		ractive.on( 'bizz-reproxy', function () {
			// original args are implicitly included...
			t.equal( arguments.length, 2 );
			t.equal( arguments[1], 'buzz' );
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.find( '#test' ), 'click' );
		component.fire( 'bar', 'bar' );
		component.fire( 'bizz', 'buzz' );
	});

	test( 'component "on-" handles reproxy of arguments correctly', t => {
		t.expect( 5 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="@this.fire("foo", event, "foo")">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="foo-reproxy" on-bar="bar-reproxy" on-bizz="bizz-reproxy"/>',
			components: { Component }
		});

		ractive.on( 'foo-reproxy', ( e, ...args ) => {
			t.equal( e.original.type, 'click' );
			t.equal( args.length, 1 );
		});
		ractive.on( 'bar-reproxy', function () {
			t.equal( arguments.length, 2 );
			// implicitly included
			t.equal( arguments[1], 'bar' );
		});
		ractive.on( 'bizz-reproxy', function () {
			t.equal( arguments.length, 1 );
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.find( '#test' ), 'click' );
		component.fire( 'bar', 'bar' );
		component.fire( 'bizz' );
	});

	test( `event expressions that return an appropriately formed array fire a proxy event`, t => {
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: `<button on-click=['foo', 'bar', 42] />`,
			on: {
				foo( ctx, bar, num ) {
					t.equal( bar, 'bar' );
					t.equal( num, 42 );
				}
			}
		});

		fire( r.find( 'button' ), 'click' );
	});

	// This fails as of 0.8.0... does that matter? Seems unnecessary to support
	//test( 'Events really do not call addEventListener when no proxy name', t => {
	// 	var ractive,
	// 		addEventListener = Element.prototype.addEventListener,
	// 		errorAdd = function(){
	// 			throw new Error('addEventListener should not be called')
	// 		};
	//
	// 	try {
	// 		Element.prototype.addEventListener = errorAdd;
	//
	// 		expect( 1 );
	//
	// 		ractive = new Ractive({
	// 			el: fixture,
	// 			template: '<span id="test" on-click="{{foo}}">click me</span>'
	// 		});
	//
	// 		ractive.on('bar', function(){
	// 			t.ok( true );
	// 		})
	//
	// 		fire( ractive.find( '#test' ), 'click' );
	//
	// 		Element.prototype.addEventListener = addEventListener;
	// 		ractive.set( 'foo', 'bar' );
	// 		fire( ractive.find( '#test' ), 'click' );
	//
	// 		Element.prototype.addEventListener = errorAdd;
	// 		ractive.set( 'foo', ' ' );
	// 		fire( ractive.find( '#test' ), 'click' );
	// 	}
	// 	finally {
	// 		Element.prototype.addEventListener = addEventListener;
	// 	}
	// });
}
