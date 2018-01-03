import { initModule } from '../../helpers/test-config';
import { fire } from 'simulant';
import { test } from 'qunit';

export default function() {
	initModule( 'events/delegate.js' );

	test( `basic delegation`, t => {
		t.expect( 6 );

		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<div on-click="ev" /><div on-click="other" />{{/each}}</div>`,
			on: {
				ev() {
					t.ok( true, 'event fired' );
				},
				other() {
					t.ok( true, 'other event fired' );
				}
			}
		});

		t.equal( count, 1 );
		Element.prototype.addEventListener = addEventListener;

		const [ top, ev, other ] = r.findAll( 'div' );
		t.ok( top._ractive.proxy.listeners.click.length === 1 && top._ractive.proxy.listeners.click.refs === 2 );
		t.ok( ev._ractive.proxy.listeners.click.length === 1 );
		t.ok( other._ractive.proxy.listeners.click.length === 1 );
		fire( top, 'click' );
		fire( ev, 'click' );
		fire( other, 'click' );
	});

	test( `delegated method event`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}{{#with ~/foo}}<div on-click="event.set('.bar', 42)" />{{/with}}{{/each}}</div>`,
			data: { foo: {} }
		});

		const div = r.findAll( 'div' )[1];
		fire( div, 'click' );
		t.equal( r.get( 'foo.bar' ), 42 );
	});

	test( `library delegated event cancellation`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<div on-click="nope"><div on-click="yep" /></div>{{/each}}</div>`,
			on: {
				nope() { t.ok( false, 'should not fire' ); },
				yep() { t.ok( true, 'should fire' ); return false; }
			}
		});

		const yep = r.findAll( 'div' )[2];
		fire( yep, 'click' );
	});

	test( `multiple delegated events don't interfere with each other`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<div on-mouseenter="yep" /><div on-mouseleave="nope" />{{/each}}</div>`,
			on: {
				nope() { t.ok( false, 'should not fire' ); },
				yep() { t.ok( true, 'should fire' ); }
			}
		});

		const yep = r.findAll( 'div' )[1];
		simulant.fire( yep, 'mouseenter' );
	});

	test( `delegated event context is correct`, t => {
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}{{#with ~/foo}}<div on-click="outer">{{#with bar}}<div on-click="inner" />{{/with}}</div>{{/with}}{{/each}}</div>`,
			data: { foo: { bar: {} } },
			on: {
				outer(ev) { t.equal( ev.resolve(), 'foo' ); },
				inner(ev) { t.equal( ev.resolve(), 'foo.bar' ); }
			}
		});

		const inner = r.findAll( 'div' )[2];
		fire( inner, 'click' );
	});

	test( `delegated events can also be raised`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: '<div>{{#each [1]}}<div on-click="yep" />{{/each}}</div>',
			on: {
				yep() { t.ok( true, 'event should fire' ); }
			}
		});

		r.getContext( r.findAll( 'div' )[1] ).raise( 'click', {} );
	});

	test( `dom events within components can also be delegated`, t => {
		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};
		const cmp = Ractive.extend({
			template: `<div on-click="ev" /><div on-click="other" />`
		});
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<cmp />{{/each}}</div>`,
			on: {
				'*.ev'() {
					t.ok( true, 'event fired' );
				},
				'*.other'() {
					t.ok( true, 'other event fired' );
				}
			},
			components: { cmp }
		});

		t.equal( count, 1 );
		Element.prototype.addEventListener = addEventListener;

		const [ top, ev, other ] = r.findAll( 'div' );
		t.ok( top._ractive.proxy.listeners.click.length === 1 && top._ractive.proxy.listeners.click.refs === 2 );
		t.ok( ev._ractive.proxy.listeners.click.length === 1 );
		t.ok( other._ractive.proxy.listeners.click.length === 1 );
		fire( top, 'click' );
		fire( ev, 'click' );
		fire( other, 'click' );
	});

	test( `delegation can be turned off`, t => {
		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};

		const cmp = Ractive.extend({
			template: `<div on-click="ev" /><div on-click="other" />`
		});
		Ractive({
			target: fixture,
			delegate: false,
			template: `<div>{{#each arr}}<div on-click="outer" /><cmp />{{/each}}</div>`,
			components: { cmp },
			data: { arr: [ 1 ] }
		});

		t.equal( count, 3 );
		Element.prototype.addEventListener = addEventListener;
	});

	test( `delegation can be turned off for specific elements with no-delegation`, t => {
		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};

		const cmp = Ractive.extend({
			template: `<div>{{#each [1]}}<div on-click="ev" /><div on-click="other" />{{/each}}</div>`
		});
		const r = new Ractive({
			target: fixture,
			template: `<div no-delegation>{{#each arr}}<div on-click="outer" /><cmp />{{/each}}</div>`,
			components: { cmp },
			data: { arr: [ 1 ] }
		});

		t.equal( count, 2 );
		Element.prototype.addEventListener = addEventListener;

		const [ top, , wrap ] = r.findAll( 'div' );
		t.ok( !top._ractive.proxy.listeners );
		t.ok( wrap._ractive.proxy.listeners.click.refs === 2 );
	});

	test( `delegated events work with non-ractive nodes (#2871)`, t => {
		let div;
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}{{#with ~/foo}}<div on-click="event.set('.bar', 42)" as-foo />{{/with}}{{/each}}</div>`,
			data: { foo: {} },
			decorators: {
				foo ( node ) {
					div = document.createElement( 'div' );
					node.appendChild( div );
					return {
						teardown () {
							node.removeChild( div );
						}
					};
				}
			}
		});

		fire( div, 'click' );
		t.equal( r.get( 'foo.bar' ), 42 );
	});

	test( `delegation in a yielder`, t => {
		t.expect( 1 );

		const cmp = Ractive.extend({
			template: `<div>{{#each list}}{{yield content}}{{/each}}</div>`
		});
		const r = new Ractive({
			target: fixture,
			template: '<cmp list="{{ [1] }}"><span on-click="foo" /></cmp>',
			components: { cmp },
			on: {
				foo() { t.ok( this.event.event.currentTarget === r.find( 'div' ) ); }
			}
		});

		fire( r.find( 'span' ), 'click' );
	});

	test( `blur events delegate correctly`, t => {
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: '<div>{{#each [1]}}<input on-focus="@.focus()" on-blur="@.blur()" />{{/each}}</div>',
			focus () { t.ok( true, 'got focus' ); },
			blur () { t.ok( true, 'got blur' ); }
		});

		const input = r.find( 'input' );
		input.focus();
		input.blur();
	});

	test( `event handlers that cause their DOM to be removed should not cause an error (#2961)`, t => {
		const r = new Ractive({
			target: fixture,
			template: '<div>{{#each list}}<div><button on-click="@.splice("list", @index, 1)">x</button></div>{{/each}}</div>',
			data: {
				list: [ 1, 2 ]
			}
		});

		fire( r.find( 'button' ), 'click' );

		t.equal( r.findAll( 'button' ).length, 1 );
	});

	test( `delegated bindings fire in the correct order (#2988)`, t => {
		t.expect( 2 );

		let selected = 1;
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each items}}<select value="{{.option}}" on-change="@.check()">{{#each options}}<option value="{{.}}">{{@index + 1}}</option>{{/each}}</select>{{/each}}</div>`,
			data: {
				options: [ 1, 2, 3 ],
				items: [ {} ]
			},
			check() {
				t.equal( this.get( 'items.0.option' ), selected );
			}
		});

		const select = r.find( 'select' );
		const options = r.findAll( 'option' );

		selected = 2;
		options[1].selected = true;
		fire( select, 'change' );

		selected = 3;
		options[2].selected = true;
		fire( select, 'change' );
	});

	test( `non-delegated listeners should not fire when inside a delegation target (#3012)`, t => {
		let ok = true;
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<button on-click="foo">ignore me</button>{{/each}}<button id="btn" on-click="check">click me</button></div>`,
			on: {
				check () {
					t.ok( ok );
					ok = false;
				}
			}
		});

		fire( r.find( '#btn' ), 'click' );
	});

	test( `delegates that happen to contain child and grandchild iterations should not duplicate events (#3036)`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<span on-click="ignored" />{{/each}}<div>{{#each [1]}}<button on-click="check">click</button>{{/each}}</div></div>`,
			on: {
				check () {
					count++;
				}
			}
		});

		fire( r.find( 'button' ), 'click' );

		t.equal( count, 1 );
	});

	test( `delegates that happen to be nested in another delegate don't fire twice`, t => {
		let count = 0;
		const r = new Ractive({
			target: fixture,
			template: `<div><div>{{#each [1]}}<button on-click="ev" />{{/each}}</div>{{#each [1]}}<button on-click="ev" />{{/each}}</div>`,
			on: {
				ev () { count++; }
			}
		});

		r.findAll( 'button' ).forEach( b => fire( b, 'click' ) );

		t.equal( count, 2 );
	});

	test( `delegated events within disabled elements don't trigger ui events (#3046)`, t => {
		const events = {};
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<div class="outer" on-click="['ev', 'outer']"><button disabled on-click="['ev', 'target']"><span on-click="['ev', 'inner']" /></button></div>{{/each}}</div>`,
			on: {
				ev ( ctx, name ) {
					if ( !events[ name ] ) events[ name ] = 1;
					else events[ name ]++;
				}
			}
		});

		fire( r.find( 'span' ), 'click' );

		t.ok( !events.target && !events.inner );

		fire( r.find( 'button' ), 'click' );

		t.ok( !events.target && !events.inner );

		fire( r.find( 'div.outer' ), 'click' );

		t.ok( !events.target && !events.inner );

		// Firefox doesn't do events at _all_ from disabled elements, whereas other browsers just stop at the disabled element
		if ( events.outer ) t.equal( events.outer, 3 );
	});
}
