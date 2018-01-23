import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'events/misc.js' );

	// TODO finish moving these into more sensible locations

	test( 'Grandchild component teardown when nested in element (#1360)', t => {
		const torndown = [];

		const Child = Ractive.extend({
			template: `
				<div>
					{{#each model.items}}
						<Grandchild/>
					{{/each}}
				</div>`,
			onteardown () {
				torndown.push( this );
			},
			isolated: false
		});

		const Grandchild = Ractive.extend({
			template: '{{title}}',
			onteardown () {
				torndown.push( this );
			},
			isolated: false
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

		ractive.set( 'model', {} );
		t.equal( torndown.length, 4 );
	});

	test( 'event references in method call handler should not create a null resolver (#1438)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `{{#foo}}<button on-click="@this.test(event.keypath + '.foo')">Click</button>{{/}}`,
			test: function () {} // eslint-disable-line object-shorthand
		});

		ractive.set( 'foo', true );

		// NOTE: if this throws and you're testing in browser, it will probably cause a half-ton of
		// other unrelated tests to fail as well
		ractive.set( 'foo', false );

		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( 'event actions and parameter references have context', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#items:i}}<span id="test{{i}}" on-click="@this.fire(eventName, event, eventName)"/>{{/}}',
			data: {
				items: [
					{ eventName: 'foo' },
					{ eventName: 'bar' },
					{ eventName: 'biz' }
				]
			}
		});

		ractive.on( 'bar', ( event, parameter ) => {
			t.equal( parameter, 'bar' );
		});

		fire( ractive.find( '#test1' ), 'click' );
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
		fire( inputs[0], 'change' );
		fire( inputs[1], 'change' );

		t.equal( ractive.get( 'list.0.foo' ), 'a' );
		t.equal( ractive.get( 'list.1.foo' ), 'b' );
	});

	test( 'Regression test for #2046', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '<button on-click="@this.onClick(eventName)">{{eventName}}</button>',
			data: { eventName: 'foo' },
			onClick ( eventName ) {
				t.equal( eventName, 'foo' );
			}
		});

		// this should have no effect
		const el = ractive.find( 'button' );
		fire( el, 'click' );
	});

	test( 'Regression test for #1971', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '<Button buttonName="{{foo}}"></Button>',
			data: { foo: 'foo' },
			components: {
				Button: Ractive.extend({
					template: '<button on-click="@this.onClick(event)"></button>',
					onClick ( event ) {
						t.deepEqual( event.get(), { buttonName: 'foo' } );
					}
				})
			}
		});

		// this should have no effect
		const el = ractive.find( 'button' );
		fire( el, 'click' );
	});

	test( 'correct function scope for this.bar() in template', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<button on-click='@this.set("foo",bar())'>click me</button>
				<p>foo: {{foo}}</p>
			`,
			data: {
				foo: 'nope',
				bar () {
					return this.get( 'answer' );
				},
				answer: 42
			}
		});

		fire( ractive.find( 'button' ), 'click' );

		t.equal( ractive.get( 'foo' ), '42' );
	});

	// phantom and IE8 don't like these tests, but browsers are ok with them
	try {
		fire( document.createElement( 'div' ), 'input' );
		fire( document.createElement( 'div' ), 'blur' );

		test( 'lazy may be overridden on a per-element basis', t => {
			let ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="true" />',
				data: { foo: 'test' },
				lazy: false
			});

			let node = ractive.find( 'input' );
			node.value = 'bar';
			fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'test' );
			fire( node, 'blur' );
			t.equal( ractive.get( 'foo' ), 'bar' );

			ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="false" />',
				data: { foo: 'test' },
				lazy: true
			});

			node = ractive.find( 'input' );
			node.value = 'bar';
			fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'bar' );
		});

		test( 'lazy may be set to a number to trigger on a timeout', t => {
			const done = t.async();

			const ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="20" />',
				data: { foo: 'test' }
			});

			const node = ractive.find( 'input' );
			node.value = 'bar';
			fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'test' );

			setTimeout( () => {
				t.equal( ractive.get( 'foo' ), 'test' );
			}, 5 );

			setTimeout( () => {
				t.equal( ractive.get( 'foo' ), 'bar' );
				done();
			}, 30 );
		});

		test( 'invalid content in method call event directive should have a reasonable error message', t => {
			t.throws(() => {
				new Ractive({
					el: fixture,
					template: '<button on-click="alert(foo);">Click Me</button>'
				});
			}, /expected/i );
		});
	} catch ( err ) {
		// do nothing
	}

	test( 'events in nested elements are torn down properly (#2608)', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: '{{#if foo}}<div><div on-foo="bar" /></div>{{/if}}',
			data: { foo: true },
			events: {
				foo () {
					count++;

					return {
						teardown () {
							count--;
						}
					};
				}
			}
		});

		t.equal( count, 1 );
		r.toggle( 'foo' );
		t.equal( count, 0 );
		r.toggle( 'foo' );
		t.equal( count, 1 );
		r.toggle( 'foo' );
		t.equal( count, 0 );
		r.toggle( 'foo' );
	});

	test( `a subscriber that cancels during event firing should not fire (#2698)`, t => {
		t.expect( 0 );

		const r = new Ractive();

		r.on( 'foo', () => cancellable.cancel() );

		const cancellable = r.on( 'foo', () => t.ok( false, 'this should not fire' ) );

		r.fire( 'foo' );
	});

	test( `re-fired event names get the new name`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div on-click="@.fire('foo', @context)" />`,
			on: {
				foo ( ctx ) { t.equal( ctx.name, 'foo' ); }
			}
		});

		fire( r.find( 'div' ), 'click' );
	});

	test( `special ref @context is available to events and replaces event`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div on-click="@.check(@context)" />`,
			check ( ctx ) {
				t.ok( ctx.node === this.find( 'div' ) );
				t.equal( ctx.name, 'click' );
				t.ok( ctx.ractive === this );
				t.ok( 'set' in ctx );
			}
		});

		fire( r.find( 'div' ), 'click' );
	});

	test( `the actual dom event is available as @event and event and original in @context`, t => {
		const r = new Ractive({
			target: fixture,
			template: '<div on-click="@.check(@event, @context)" />',
			check ( ev, ctx ) {
				t.ok( ev.target === r.find( 'div' ) );
				t.ok( ev === ctx.event );
				t.ok( ev === ctx.original );
			}
		});

		fire( r.find( 'div' ), 'click' );
	});

	test( `custom event plugins can pass along a source dom event`, t => {
		t.expect( 4 );

		const r = new Ractive({
			target: fixture,
			template: `<div on-foo="@.check(@event, @context)" on-bar="@.check(@event, @context)" />`,
			events: {
				foo ( node, fire ) {
					const listener = ev => fire({ node, original: ev });
					node.addEventListener( 'click', listener );
					return { teardown () { node.removeEventListener( 'click', listener ); } };
				},
				bar ( node, fire ) {
					const listener = ev => fire({ node, event: ev });
					node.addEventListener( 'click', listener );
					return { teardown () { node.removeEventListener( 'click', listener ); } };
				}
			},
			check ( ev, ctx ) {
				t.ok( ev === ctx.event && ev  === ctx.original );
				t.ok( ev.target === ctx.node && ev.target === this.find( 'div' ) );
			}
		});

		fire( r.find( 'div' ), 'click' );
	});

	test( `the event directive's node is exposed as @node`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#with foo}}<input twoway=false on-change="@context.set('.bar', @node.value)" />{{/with}}`,
			data: { foo: {} }
		});

		const input = r.find( 'input' );
		input.value = 'yep';
		fire( input, 'change' );

		t.equal( r.get( 'foo.bar' ), 'yep' );
	});
}
