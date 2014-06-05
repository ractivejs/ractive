define([
	'config/options/registry'
], function (
	registryConfig
) {

	'use strict';

	return function () {

		var Ractive, ractive, registries,
			item = { key: 'value' },
			item1 = { one: 'one' },
			item2 = { two: 'two' };

		function setupRegistries () {

			Ractive = {};

			function create( name, defaultValue ) {

				var options = { name: name, defaultValue: defaultValue },
					itemConfig = registryConfig( options );

			    // use extend to bootstrap the defaults on our mock Ractive
			    var bootstrap = {};
			    bootstrap[ name ] = options.defaultValue;
				itemConfig.extend( null, Ractive, bootstrap);

				return itemConfig;
			}

			registries = {
				empty: create( 'empty' ),
				withDefault: create( 'withDefault', item ),
				withFn: create( 'withFn', registry => { registry.key = 'value'; } ),
				withReturnFn: create( 'withReturnFn', () => { return item; } )
			}

		}

		module( 'Ractive Registry', { setup: setupRegistries });


		function getFnValue ( Target, name ) {

			if( typeof name !== 'string' ) { name = name.name }

			var value = {}, fn = Target[ name ];
			ok( typeof fn === 'function' );
			fn = fn.bind( Target );

			return fn( value ) || value;

		}

		function testEachExceptEmptyHasItem ( target ) {

			ok( !target[ registries.empty.name ].key, 'empty' );
			equal( target[ registries.withDefault.name ].key, item.key, 'withDefault' );
			equal( getFnValue( target, registries.withFn ).key, item.key, 'withFn' );
			equal( getFnValue( target, registries.withReturnFn ).key, item.key, 'withReturnFn' );
		}


		function testEachHas ( target, key, value ) {

			function testFnRegistry( registry ) {
				var evaled = getFnValue( target, registry );
				equal( evaled[ key ], value, registry.name );
			}

			equal( target[ registries.empty.name ][ key ], value, 'empty' );
			equal( target[ registries.withDefault.name ][ key ], value, 'withDefault' );
			testFnRegistry( registries.withFn );
			testFnRegistry( registries.withReturnFn );
		}

		function testEachHasItem1 ( target ) {
			testEachHas( target, 'one', item1.one );
		}

		function testEachHasItem2 ( target ) {
			testEachHas( target, 'two', item2.two );
		}

		test( 'create', t => {

			for ( let name in registries ) {
				t.ok( Ractive[ name ], name + ' exists' );
			}

			testEachExceptEmptyHasItem( Ractive );

		});

		module( 'Extend Registry', { setup: setupRegistries } );

		test( 'extend with empty (no new) registry', t => {
			var Child = {};

			for ( let name in registries ) {
				let manager = registries[ name ].extend( Ractive, Child );
				t.ok( Child[ name ] );
				t.notEqual( Ractive[ name ], Child[ name ], 'not same instance' );
			}

			testEachExceptEmptyHasItem( Child );

		});

		test( 'extend with static registry', t => {

			var Child = {};

			for ( let name in registries ) {
				let options = {};
				options[ name ] = item1;
				registries[ name ].extend( Ractive, Child, options );
				t.notEqual( Child[ name ], item1, 'not same instance as options' );
			}

			testEachExceptEmptyHasItem( Child );
			testEachHasItem1( Child );

		});

		test( 'extend with function registry', t => {

			var Child = {},
				extendFn = function ( registry ) {
					this._super( registry );
					registry.one = item1.one;
				};

			for ( let name in registries ) {

				let options = {};
				options[ name ] = extendFn;
				registries[ name ].extend( Ractive, Child, options );
				t.notEqual( Child[ name ], item1, 'not same instance as options' );

				let evaled = getFnValue( Child, name );
				if ( name !== 'empty' ) {
					t.equal( evaled.key, item.key );
				}

				t.equal( evaled.one, item1.one );
			}

		});

		test( 'extend with return value function registry', t => {

			var Child = {}, evaled,
				extendFn = function ( registry ) {
					return item1;
				};

			for ( let name in registries ) {
				let options = {};
				options[ name ] = extendFn;
				registries[ name ].extend( Ractive, Child, options );
				t.notEqual( Child[ name ], item1, 'not same instance as options' );

				t.equal( getFnValue( Child, name ).one, item1.one, name );
			}

		});

		test( 'function then static mixed case extend', t => {

			var Child = {}, Parent = {}, evaled,
				extendFn = function ( registry ) {
					this._super( registry );
					registry.one = item1.one;
				};

			for ( let name in registries ) {

				let opt1 = {}, opt2 = {};
				opt1[ name ] = extendFn;
				opt2[ name ] = item2;

				registries[ name ].extend( Ractive, Parent, opt1 );
				registries[ name ].extend( Parent, Child, opt2 );

				let value = getFnValue( Child, registries[ name ] );

				if ( name !== 'empty' ) {
					t.equal( value.key, item.key, name );
				}
				t.equal( value.one, item1.one, name );
				t.equal( value.two, item2.two, name );
			}

		});

		test( 'static then function mixed case extend', t => {

			var Child = {}, Parent = {}, evaled,
				extendFn = function ( registry ) {
					this._super( registry );
					registry.one = item1.one;
				};

			for ( let name in registries ) {

				let opt1 = {}, opt2 = {};
				opt1[ name ] = extendFn;
				opt2[ name ] = item2;

				registries[ name ].extend( Ractive, Parent, opt2 );
				registries[ name ].extend( Parent, Child, opt1 );

				let value = getFnValue( Child, registries[ name ] );

				if ( name !== 'empty' ) {
					t.equal( value.key, item.key, name );
				}
				t.equal( value.one, item1.one, name );
				t.equal( value.two, item2.two, name );
			}

		});

		module( 'Overwrites', { setup: setupRegistries } );

		test( 'Replace after create', t => {
			var Child = {};

			for ( let name in registries ) {
				let options = {};
				options[ name ] = item1;

				// replaces any existing registry values
				Ractive[ name ] = item2;

				registries[ name ].extend( Ractive, Child, options );

				t.equal( Child[ name ].one, item1.one, name );
				t.equal( Child[ name ].two, item2.two, name );
			}

		});

		test( 'Add key after create', t => {
			var Child = {}, reg;

			for ( let name in registries ) {
				let options = {};
				options[ name ] = item1;
				Ractive[ name ].two = item2.two;
				registries[ name ].extend( Ractive, Child, options );
			}

			testEachExceptEmptyHasItem( Child );
			testEachHasItem1( Child );
			testEachHasItem2( Child );

		});

		module( 'Initialise Registry', {
			setup: () => {
				setupRegistries();
				ractive = { _config: {} };
			}
		});

		function testInstanceHasItemExceptEmpty ( ractive ) {

			for ( let name in registries ) {
				let value = ( name === 'empty' ) ? void 0 : item.key;
				equal( ractive[ name ].key, value );
			}
		}

		function testInstanceHas ( ractive, key, value ) {

			for ( let name in registries ) {
				equal( ractive[ name ][ key ], value );
			}
		}

		function testInstanceHasItem1 ( ractive ) {
			testInstanceHas( ractive, 'one', item1.one );
		}

		function testInstanceHasItem2 ( ractive ) {
			testInstanceHas( ractive, 'two', item2.two );
		}

		function testInstanceSetup ( ractive, name, option ) {

			ok( ractive[ name ], 'has registry ' + name );
			notEqual( ractive[ name ], Ractive[ name ], 'not same ractive as Ractive' );
			notEqual( ractive[ name ], option, 'not same ractive as options' );
		}

		test( 'init with no options', t => {

			for ( let name in registries ) {
				let manager = registries[ name ].init( Ractive, ractive );

				testInstanceSetup( ractive, name );
			}

			testInstanceHasItemExceptEmpty( ractive );

		});

		test( 'init with static registry', t => {

			for ( let name in registries ) {
				let options = {};
				options[ name ] = item1;
				registries[ name ].init( Ractive, ractive, options );

				testInstanceSetup( ractive, name, item1 );
			}

			testInstanceHasItemExceptEmpty( ractive );
			testInstanceHasItem1( ractive );

		});

		test( 'init with function registry', t => {

			var extendFn = function ( registry ) {
					this._super( registry );
					registry.one = item1.one;
				};

			for ( let name in registries ) {

				let options = {};
				options[ name ] = extendFn;
				registries[ name ].init( Ractive, ractive, options );

				testInstanceSetup( ractive, name );
			}

			testInstanceHasItemExceptEmpty( ractive );
			testInstanceHasItem1( ractive );

		});

		test( 'init with return value function registry', t => {

			var extendFn = function ( registry ) {
					return item1;
				};

			for ( let name in registries ) {
				let options = {};
				options[ name ] = extendFn;
				registries[ name ].init( Ractive, ractive, options );

				testInstanceSetup( ractive, name );

				t.ok( !ractive[ name ].key, 'no item' );
			}

			testInstanceHasItem1( ractive );

		});

		test( 'init with static from function extend', t => {

			var Child = {},
				extendFn = function ( registry ) {
					this._super( registry );
					registry.one = item1.one;
				};

			for ( let name in registries ) {

				let opt1 = {}, opt2 = {};
				opt1[ name ] = extendFn;
				opt2[ name ] = item2;

				registries[ name ].extend( Ractive, Child, opt1 );
				registries[ name ].init( Child, ractive, opt2 );

				testInstanceSetup( ractive, name );
			}

			testInstanceHasItemExceptEmpty( ractive );
			testInstanceHasItem1( ractive );
			testInstanceHasItem2( ractive );

		});

		test( 'init with function from static extend', t => {

			var Child = {},
				extendFn = function ( registry ) {
					this._super( registry );
					registry.one = item1.one;
				};

			for ( let name in registries ) {

				let opt1 = {}, opt2 = {};
				opt1[ name ] = extendFn;
				opt2[ name ] = item2;

				registries[ name ].extend( Ractive, Child, opt2 );
				registries[ name ].init( Child, ractive, opt1 );

				testInstanceSetup( ractive, name );
			}

			testInstanceHasItemExceptEmpty( ractive );
			testInstanceHasItem1( ractive );
			testInstanceHasItem2( ractive );

		});

		test( 'init with dynamic function registry', t => {

			var extendFn = function ( registry, data ) {
					this._super( registry );
					if ( data.good ) {
						registry.one = item1.one;
					}
				};

			for ( let name in registries ) {

				let options = {};
				options[ name ] = extendFn;
				ractive.data = { good: true };

				registries[ name ].init( Ractive, ractive, options );

				testInstanceSetup( ractive, name );
			}

			testInstanceHasItemExceptEmpty( ractive );
			testInstanceHasItem1( ractive );

		});

		test( 'init with dynamic function with dynamic function extend', t => {

			var Child = {},
				extendFn1 = function ( registry, data ) {
					this._super( registry, data );
					if ( !data.good ) {
						registry.one = item1.one;
					}
				},
				extendFn2 = function ( registry, data ) {
					this._super( registry, data );
					if ( data.good ) {
						registry.two = item2.two;
					}
				};

			for ( let name in registries ) {

				let opt1 = {}, opt2 = {};
				opt1[ name ] = extendFn1;
				opt2[ name ] = extendFn2;

				ractive.data = { good: true }

				registries[ name ].extend( Ractive, Child, opt1 );
				registries[ name ].init( Child, ractive, opt2 );

				testInstanceSetup( ractive, name );

				t.ok( !ractive[ name ].one, 'no item one' );
			}

			testInstanceHasItemExceptEmpty( ractive );
			testInstanceHasItem2( ractive );

		});

	};



});
