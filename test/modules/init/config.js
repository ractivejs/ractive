define([
	'ractive',
	'Ractive/config/defaults',
	'Ractive/config/config',
	'Ractive/config/registries',
	'shared/registry'
], function (
	Ractive,
	defaults,
	config,
	registries,
	registry
) {

	'use strict';

	var findInViewHierarchy = registry.findInViewHierarchy;

	// TEMPORARY, until we switch to ES6
	Ractive = Ractive.default || Ractive;
	defaults = defaults.default || defaults;
	config = config.default || config;
	registries = registries.default || registries;

	return function () {

		module( 'Configuration' );

		test( 'Ractive.defaults', t => {
			t.equal( Ractive.defaults, Ractive.prototype, 'defaults aliases prototype' );

			for( let key in defaults ) {
				t.ok( Ractive.defaults.hasOwnProperty( key ), 'has default ' + key )
			}
		});

		test( 'instance has config options', t => {
			var ractive = new Ractive(),
				registryNames = registries.map( r => r.name );

			config.order.forEach( itemConfig => {

				var name = itemConfig.name || itemConfig,
					actual = ractive,
					expected = Ractive.prototype;

				if ( expected && ( name in expected ) ) {
					ok( name in actual, 'has ' + name);
				}

				if ( expected ) {
					if ( !~registryNames.indexOf( name ) && name !== 'template' ) { // TODO template is a special case... this should probably be handled differently
						deepEqual( actual[ name ], expected[ name ], 'compare ' + name );
					}
				}
			});
		});

		test( 'find registry in hierarchy', t => {
			var adaptor1 = {}, adaptor2 = {},
				parent = new Ractive( { adaptors: { foo: adaptor1 } } ),
				ractive = new Ractive( { adaptors: { bar: adaptor2 } } );

			ractive.parent = parent;

			t.equal( findInViewHierarchy( 'adaptors', ractive, 'foo' ), adaptor1 );
			t.equal( findInViewHierarchy( 'adaptors', ractive, 'bar' ), adaptor2 );
		});

		test( 'non-configurations options are added to instance', t => {

			var ractive = new Ractive({
				foo: 'bar',
				fumble: function () {
					return true;
				}
			});

			t.equal( ractive.foo, 'bar' );
			t.ok( ractive.fumble() );
		});
	};
});
