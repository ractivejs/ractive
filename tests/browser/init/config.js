import { test } from 'qunit';
import defaults from '../../../src/Ractive/config/defaults';
import config from '../../../src/Ractive/config/config';
import registries from '../../../src/Ractive/config/registries';
import { findInViewHierarchy } from '../../../src/shared/registry';
import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'init/config.js' );

	test( 'Ractive.defaults', t => {
		t.equal( Ractive.defaults, Ractive.prototype, 'defaults aliases prototype' );

		for( const key in defaults ) {
			t.ok( Ractive.defaults.hasOwnProperty( key ), 'has default ' + key );
		}
	});

	test( 'instance has config options', t => {
		const ractive = new Ractive();
		const registryNames = registries.map( r => r.name );

		config.order.forEach( itemConfig => {
			const name = itemConfig.name || itemConfig;

			if ( name in Ractive.prototype ) {
				t.ok( name in ractive, 'has ' + name);
			}

			if ( !~registryNames.indexOf( name ) && !/^(template|data)$/.test( name ) ) { // TODO template is a special case... this should probably be handled differently
				t.deepEqual( ractive[ name ], Ractive.prototype[ name ], 'compare ' + name );
			}
		});
	});

	test( 'find registry in hierarchy', t => {
		const adaptor1 = {};
		const adaptor2 = {};
		const parent = new Ractive( { adaptors: { foo: adaptor1 } } );
		const ractive = new Ractive( { adaptors: { bar: adaptor2 }, isolated: false } );

		ractive.parent = parent;

		t.equal( findInViewHierarchy( 'adaptors', ractive, 'foo' ), adaptor1 );
		t.equal( findInViewHierarchy( 'adaptors', ractive, 'bar' ), adaptor2 );
	});

	test( 'non-configurations options are added to instance', t => {
		const ractive = new Ractive({
			foo: 'bar',
			fumble () {
				return true;
			}
		});

		t.equal( ractive.foo, 'bar' );
		t.ok( ractive.fumble() );
	});

	test( 'target element can be specified with target as well as el (#1848)', t => {
		const r = new Ractive({
			target: fixture,
			template: 'yep'
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
		t.strictEqual( fixture, r.target );
		t.strictEqual( fixture, r.el );
	});

	test( 'events can be subscribed with the on option', t => {
		t.expect( 2 );

		const r = new Ractive({
			on: {
				foo() { t.ok( true ); },
				bar: {
					once: true,
					handler() { t.ok( true ); }
				}
			}
		});

		r.fire( 'foo' );
		r.fire( 'bar' );
		r.fire( 'bar' );
	});

	test( 'observers can be subscribed with the observe option', t => {
		t.expect( 4 );

		const r = new Ractive({
			observe: {
				foo() { t.ok( true ); },
				bar: {
					once: true,
					handler() { t.ok( true ); }
				},
				baz: {
					init: false,
					handler() { t.ok( true ); }
				}
			}
		});

		// foo has already run once, because init defaults to true
		r.toggle( 'foo' );
		r.toggle( 'bar' );
		r.toggle( 'bar' );
		r.toggle( 'baz' );
	});
}
