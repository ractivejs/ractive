define([
	'ractive',
	'config/configuration',
	'config/initOptions',
	'config/registries/registries'
], function (
	Ractive,
	config,
	initOptions,
	registries
) {

	'use strict';

	return function () {

		var Child, ractive;

		function configureRactive () {
			Child = void 0;
			ractive = void 0;
		}

		function testConfiguration ( target, compare, noTargetDefaults ) {

			registries.forEach( itemConfig => {

				var name = itemConfig.name,
					useDefaults = itemConfig.config.useDefaults,
					actual = useDefaults && !noTargetDefaults ? target.defaults : target,
					expected = useDefaults && compare ? compare.defaults : compare;

				ok( actual[ name ], 'has ' + name)

				if ( expected ) {

					deepEqual( actual[ name ], expected[ name ], 'compare ' + name );
				}

			});

		}

		test( 'base Ractive', t => {

			t.deepEqual( Ractive.defaults, initOptions.defaults, 'has defaults' );

		});

		module( 'Extend Ractive', {
			setup: function () {
				configureRactive();
				Child = () => {};
				config.extend( Ractive, Child, {} );
			}
		} );

		test( 'extended', t => {

			t.deepEqual( Ractive.defaults, Child.defaults, 'defaults' );
			testConfiguration( Child, Ractive );

		});

		module( 'Configure Instance', {
			setup: function () {
				configureRactive();
				ractive = {};
				config.init( Ractive, ractive, {} );
			}
		} );

		test( 'ractive instance', t => {

			testConfiguration( ractive, Ractive, true );

			// initOptions.flags.forEach( flag => {
			// 	t.equal( Ractive.defaults[ flag ], ractive[ flag ], flag );
			// });

		});

		module( 'Configure Instance', { setup: configureRactive } );

		test( 'find configuration', t => {

			var parent = {}, ractive = {}, adaptor1 = {}, adaptor2 = {};

			config.init( Ractive, parent, { adaptors: { foo: adaptor1 } } );
			config.init( Ractive, ractive, { adaptors: { bar: adaptor2 } } );

			ractive._parent = parent;

			t.equal( config.find( ractive, 'adaptors', 'foo' ), adaptor1 );
			t.equal( config.find( ractive, 'adaptors', 'bar' ), adaptor2 );

		});




	};



});
