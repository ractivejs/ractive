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

		var Child, ractive, fixture = document.getElementById( 'qunit-fixture' );

		function configureRactive () {
			Child = void 0;
			ractive = void 0;
		}

		function testConfiguration ( target, compare, noTargetDefaults ) {

			config.forEach( itemConfig => {

				var name = itemConfig.name,
					actual = target,
					expected = compare.prototype;

				if ( expected && ( name in expected ) ) {
					ok( name in actual, 'has ' + name);
				}

				if ( expected ) {
					if ( config.registries[ name ] ) {

					}
					else {
						deepEqual( actual[ name ], expected[ name ], 'compare ' + name );
					}
				}
			});
		}

		test( 'base Ractive', t => {
			t.deepEqual( Ractive.defaults, Ractive.prototype, 'defaults aliases prototype' );

			for( let key in defaults ) {
				t.ok( Ractive.defaults.hasOwnProperty( key ), 'has default ' + key )
			}
		});

		module( 'Extend Ractive', {
			setup: function () {
				configureRactive();
				Child = () => {};
				Child.defaults = {};
				config.extend( Ractive, Child, {} );
			}
		} );

		module( 'Configure Instance', {
			setup: function () {
				configureRactive();
				ractive = new Ractive();
			}
		} );

		test( 'ractive instance', t => {
			testConfiguration( ractive, Ractive, true );
		});

		module( 'Configure Instance', { setup: configureRactive } );

		test( 'find registry configuration', t => {
			var adaptor1 = {}, adaptor2 = {},
				parent = new Ractive( { adaptors: { foo: adaptor1 } } ),
				ractive = new Ractive( { adaptors: { bar: adaptor2 } } );

			ractive._parent = parent;

			t.equal( config.registries.adaptors.find( ractive, 'foo' ), adaptor1 );
			t.equal( config.registries.adaptors.find( ractive, 'bar' ), adaptor2 );
		});

		module( 'options' );

		if ( Ractive.magic ) {
			test( 'are passed to init with correct values ', t => {
				expect( 2 );

				var Component = Ractive.extend({
					init: function ( options ) {
						t.equal( options.foo, 'bar' );
						t.ok( options.magic );
					}
				});

				var ractive = new Component({
					el: fixture,
					foo: 'bar',
					magic: true
				});
			});
		}
	};
});
