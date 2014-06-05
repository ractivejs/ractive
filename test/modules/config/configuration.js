define([
	'ractive',
	'config/options/defaults',
	'config/config'
], function (
	Ractive,
	defaults,
	config
) {

	'use strict';

	return function () {

		var Child, ractive;

		function configureRactive () {
			Child = void 0;
			ractive = void 0;
		}

		function testConfiguration ( target, compare, noTargetDefaults ) {

			config.forEach( itemConfig => {

				var name = itemConfig.name,
					useDefaults = itemConfig.useDefaults,
					actual = useDefaults && !noTargetDefaults ? target.defaults : target,
					expected = useDefaults && compare ? compare.defaults : compare;

				if ( noTargetDefaults && config.parseOptions[ name ] ) {
					actual = actual.parseOptions;
				}

				if ( !expected[name] ) {
					ok ( !actual[ name ], 'empty ' + name );
				} else {
					ok( actual.hasOwnProperty( name ), 'has ' + name);
				}

				if ( expected ) {

					deepEqual( actual[ name ], expected[ name ], 'compare ' + name );
				}

			});

		}

		test( 'base Ractive', t => {

			t.deepEqual( Ractive.defaults, defaults, 'has defaults' );

		});

		module( 'Extend Ractive', {
			setup: function () {
				configureRactive();
				Child = () => {};
				Child.defaults = {};
				config.extend( Ractive, Child, {} );
			}
		} );

		test( 'extended', t => {

			testConfiguration( Child, Ractive );

		});

		module( 'Configure Instance', {
			setup: function () {
				configureRactive();
				ractive = { parseOptions: {} };
				config.init( Ractive, ractive, {} );
			}
		} );

		test( 'ractive instance', t => {

			testConfiguration( ractive, Ractive, true );

		});

		module( 'Configure Instance', { setup: configureRactive } );

		test( 'find configuration', t => {

			var parent = { parseOptions: {} },
				ractive = { parseOptions: {} },
				adaptor1 = {}, adaptor2 = {};

			config.init( Ractive, parent, { adaptors: { foo: adaptor1 } } );
			config.init( Ractive, ractive, { adaptors: { bar: adaptor2 } } );

			ractive._parent = parent;

			t.equal( config.find( ractive, 'adaptors', 'foo' ), adaptor1 );
			t.equal( config.find( ractive, 'adaptors', 'bar' ), adaptor2 );

		});




	};



});
