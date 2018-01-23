import { hasUsableConsole, onWarn, onLog, initModule } from '../../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'init/hooks/misc.js' );

	test( 'detach and insert hooks fire', t => {
		const fired = [];

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

	test( 'correct behaviour of deprecated beforeInit hook (#1395)', t => {
		t.expect( 6 );

		let count;
		const reset = () => count = { construct: 0, beforeInit: 0 };
		reset();

		// specifying both options is an error
		t.throws( () => {
			new Ractive({
				onconstruct: () => count.construct += 1,
				beforeInit: () => count.beforeInit += 1
			});
		}, /cannot specify both options/ );

		// hooks-without-extend were introduced at the same time as beforeInit was
		// deprecated, so this should not fire
		onWarn( msg => t.ok( /deprecated/.test( msg ) ) );

		reset();
		new Ractive({
			beforeInit: () => count.beforeInit += 1
		});
		t.deepEqual( count, { construct: 0, beforeInit: 0 });

		let Subclass;

		t.throws( () => {
			Subclass = Ractive.extend({
				onconstruct: () => count.construct += 1,
				beforeInit: () => count.beforeInit += 1
			});
			new Subclass();
		}, /cannot specify both options/ );

		reset();
		Subclass = Ractive.extend({
			beforeInit: () => count.beforeInit += 1
		});
		new Subclass();
		t.deepEqual( count, { construct: 0, beforeInit: 1 });
	});

	if ( hasUsableConsole ) {
		test( 'error in oncomplete sent to console', t => {
			t.expect( 2 );

			const done = t.async();

			onWarn( msg => {
				if ( /DEBUG_PROMISES/.test( msg ) ) {
					return;
				}

				t.ok( /error happened during rendering/.test( msg ) );
			});

			onLog( error => {
				if ( /debug mode/.test( error ) ) {
					return;
				}

				t.ok( error instanceof Error );
				done();
			});

			new Ractive({
				el: fixture,
				template: 'foo',
				oncomplete () {
					throw new Error( 'evil handler' );
				}
			});
		});
	}

	test( 'oncomplete should not be fired if teardown is invoked while the rendering phase is still in progress (#2945)', t => {
		t.expect( 1 );

		const done = t.async();

		const ractive = new Ractive({
			template: '<p>foo</p>',

			oncomplete () {
				t.ok( false );
			}
		});

		ractive.render( fixture );

		ractive.teardown().then ( () => {
			t.ok( true );
			done();
		} );
	});

	test( 'hooks include the source ractive instance as the last argument', t => {
		const done = t.async();
		t.expect( 3 );

		const cmp = Ractive.extend();
		const r = new Ractive({
			template: '<cmp />',
			components: { cmp }
		});
		const c = r.findComponent( 'cmp' );

		r.on( 'cmp.render', ( ctx, inst ) => { t.ok( c === inst ); } );
		r.on( 'cmp.complete', ( ctx, inst ) => { t.ok( c === inst ); } );
		r.on( 'cmp.teardown', ( ctx, inst ) => { t.ok( c === inst ); } );

		r.render( fixture );

		setTimeout( () => {
			r.teardown().then ( () => {
				done();
			} );
		} );
	});
}
