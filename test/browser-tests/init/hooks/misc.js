import { test } from 'qunit';
import { hasUsableConsole, onWarn, onLog } from '../../test-config';
import { initModule } from '../../test-config';

export default function() {
	initModule( 'init/hooks/misc.js' );

	test( 'detach and insert hooks fire', t => {
		let fired = [];

		const ractive = new Ractive({
			el: fixture,
			template: 'foo',
			oninsert () {
				fired.push( 'oninsert' );
			},
			ondetach () {
				fired.push( 'ondetach' );
			}
		});

		ractive.detach();
		ractive.insert( fixture );

		t.deepEqual( fired, [ 'ondetach', 'oninsert' ] );
	});

	test( 'late-comer components on render still fire init', t => {
		const Widget = Ractive.extend({
			template: '{{~/init}}',
			oninit () {
				this.set( 'init', 'yes' );
			}
		});

		const Widget2 = Ractive.extend({
			template: '',
			oninit () {
				this.set( 'show', true );
			}
		});

		new Ractive( {
			el: fixture,
			template: '{{#show}}<Widget/>{{/}}<Widget2 show="{{show}}"/>',
			components: { Widget, Widget2 }
		});

		t.equal( fixture.innerHTML, 'yes' );
	});

	test( 'component with data dependency can be found in oninit', t => {
		const Component = Ractive.extend();
		let component = null;

		new Ractive( {
			el: fixture,
			data: { show: true },
			template: '{{#show}}<Component/>{{/}}',
			components: { Component },
			oninit () { component = this.findComponent( 'Component' ); }
		});

		t.ok( component );
	});

	test( 'render hooks are not fired until after DOM updates (#1367)', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: '<one/>',
			components: {
				one: Ractive.extend({
					template: `
						{{#if bool}}
							<p></p>
						{{/if}}

						{{#if bool}}
							<two/>
						{{/if}}`
				}),
				two: Ractive.extend({
					onrender () {
						this.parent.find( 'whatever' );
					}
				})
			}
		});

		// If the `<one>` component is not rendered, the `<two>` component's
		// render handler will cause an error
		ractive.set( 'bool', true );
	});

	test( 'change hook fires even if no fragments changed (#2090)', t => {
		t.expect( 8 );

		let count = 1, next = false;
		const r = new Ractive({
			data: { foo: 1 }
		});

		r.on( 'change', delta => {
			t.equal( Object.keys(delta).length, 1 );

			if ( !next ) t.equal( delta.foo, count );
			else t.equal( delta.bar, 'yep' );
		});

		count++;
		r.set( 'foo', count );

		count = 42;
		r.set( 'foo', count );

		next = true;
		r.set( 'bar', 'yep' );

		r.get().bar = 'hmm';
		r.update( 'bar' );
	});

	test( 'change event fires with correct value if the key is computed (#2520)', t => {
		t.expect( 1 );

		let foo = 'hello';
		const r = new Ractive({
			computed: {
				foo: {
					get() { return foo; },
					set( value ) {
						foo = value;
						this.update( 'foo' );
					}
				}
			}
		});

		r.on( 'change', ( changes ) => {
			t.equal( changes.foo, 'yep' );
		});

		r.set( 'foo', 'yep' );
	});
}
