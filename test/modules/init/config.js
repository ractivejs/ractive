define([
	'ractive',
	'config/defaults/options',
	'config/config'
], function (
	Ractive,
	defaults,
	config
) {

	'use strict';

	return function () {

		module( 'Configuration' );

		test( 'Ractive.defaults', t => {
			t.equal( Ractive.defaults, Ractive.prototype, 'defaults aliases prototype' );

			for( let key in defaults ) {
				t.ok( Ractive.defaults.hasOwnProperty( key ), 'has default ' + key )
			}
		});

		test( 'instance has config options', t => {
			var ractive = new Ractive();

			config.forEach( itemConfig => {

				var name = itemConfig.name || itemConfig,
					actual = ractive,
					expected = Ractive.prototype;

				if ( expected && ( name in expected ) ) {
					ok( name in actual, 'has ' + name);
				}

				if ( expected ) {
					if ( !config.registries[ name ] && name !== 'template' ) { // TODO template is a special case... this should probably be handled differently
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

			t.equal( config.registries.adaptors.find( ractive, 'foo' ), adaptor1 );
			t.equal( config.registries.adaptors.find( ractive, 'bar' ), adaptor2 );
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
