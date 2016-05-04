import { test } from 'qunit';
import { fire } from 'simulant';
import { initModule } from '../test-config';

export default function() {
	initModule( 'events/misc.js' );

	// TODO finish moving these into more sensible locations

	test( 'Grandchild component teardown when nested in element (#1360)', t => {
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

		ractive.set( 'model', {} );
		t.equal( torndown.length, 4 );
	});

	test( 'event references in method call handler should not create a null resolver (#1438)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `{{#foo}}<button on-click="test(event.keypath + '.foo')">Click</button>{{/}}`,
			test () {}
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
		});

		fire( ractive.nodes.test1, 'click' );
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
			template: '<button on-click="onClick(eventName)">{{eventName}}</button>',
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
					template: '<button on-click="onClick(event)"></button>',
					onClick ( event ) {
						t.deepEqual( event.context, { buttonName: 'foo' } );
					}
				})
			}
		});

		// this should have no effect
		const el = ractive.find( 'button' );
		fire( el, 'click' );
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
		
		test( 'lazy may be dynamic', t => {
			const done = t.async();

			let ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="{{isLazy}}" />',
				data: { foo: 'test', isLazy: true }
			});

			let node = ractive.find( 'input' );
			node.value = 'bar';
			fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'test' );
			fire( node, 'blur' );
			t.equal( ractive.get( 'foo' ), 'bar' );

			ractive.set( 'isLazy', false );

			node = ractive.find( 'input' );
			node.value = 'bar';
			fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'bar' );
			
			
			
			
			ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="{{lazyTimeout}}" />',
				data: { foo: 'test', lazyTimeout: 20 }
			});
			
			node = ractive.find( 'input' );
			node.value = 'bar';
			fire( node, 'input' );
			t.equal( ractive.get( 'foo' ), 'test' );

			setTimeout( () => {
				t.equal( ractive.get( 'foo' ), 'test' );
			}, 5 );

			setTimeout( () => {
				t.equal( ractive.get( 'foo' ), 'bar' );
				
				ractive.set( 'lazyTimeout', 10 );

				let node = ractive.find( 'input' );
				node.value = 'baz';
				fire( node, 'input' );
				t.equal( ractive.get( 'foo' ), 'bar' );

				setTimeout( () => {
					t.equal( ractive.get( 'foo' ), 'bar' );
				}, 5 );

				setTimeout( () => {
					t.equal( ractive.get( 'foo' ), 'baz' );
					done();
				}, 15 );
			}, 30 );			
			
			
		});

		test( 'lazy may be set to a number to trigger on a timeout', t => {
			const done = t.async();

			const ractive = new Ractive({
				el: fixture,
				template: '<input value="{{foo}}" lazy="20" />',
				data: { foo: 'test' }
			});

			let node = ractive.find( 'input' );
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

		test( '{{else}} blocks work in event names (#1598)', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<button on-click="{{#if foo}}event1{{else}}event2{{/if}}"></button>',
				data: {
					foo: true
				}
			});

			let event1Fired;
			let event2Fired;

			ractive.on({
				event1: () => event1Fired = true,
				event2: () => event2Fired = true
			});

			const button = ractive.find( 'button' );

			fire( button, 'click' );
			t.ok( event1Fired );
			t.ok( !event2Fired );

			event1Fired = false;
			ractive.set( 'foo', false );
			fire( button, 'click' );
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
	} catch ( err ) {
		// do nothing
	}
}
