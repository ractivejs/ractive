define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture

		module( 'Lifecycle events' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );


		test( 'construct', t => {

			expect( 4 )

			var fired = [], options = {
				construct: function( options ) {
					fired.push( this );
					options.template = '{{foo}}';
					options.data = { foo: 'bar' };
				}
			};

			function test( Constructor, options = {} ) {

				options.el = fixture;

				var ractive = new Constructor(options),
					widget = ractive.findComponent( 'widget' ),
					expected = [ widget || ractive ];

				t.deepEqual( fired, expected );
				t.equal( fixture.innerHTML, 'bar' );

				ractive.teardown();
				fired = [];
			}

			test( Ractive.extend( options ) );

			test( Ractive, {
				template: '<widget/>',
				components: {
					widget: Ractive.extend(options)
				}
			})
		});

		test( 'config', t => {

			expect( 8 )

			var fired = [], options = {
				config: function() {
					fired.push( this );
					this.data.foo++;
				},
				template: '{{foo}}',
				data: 1
			};

			function test( Constructor, options = {} ) {

				options.el = fixture;

				var ractive = new Constructor(options),
					widget = ractive.findComponent( 'widget' ),
					expected = [ractive];

				if( widget ) {
					expected.push( widget );
				}

				t.deepEqual( fired, expected );
				t.equal( fixture.innerHTML, '2' );

				ractive.teardown();
				fired = [];
			}

			test( Ractive, options );
			// test( Ractive.extend( options ) );

			// test( Ractive, {
			// 	el: fixture,
			// 	template: '<widget/>',
			// 	config: function () {
			// 		fired.push( this );
			// 	},
			// 	components: {
			// 		widget: Ractive.extend(options)
			// 	}
			// }, true)

			// var ractive = new (Ractive.extend( options ) )( {
			// 	config: function( options ) {
			// 		fired.push( this );
			// 		options.data = { foo: 12 };
			// 	}
			// });

			// t.deepEqual( fired, [ ractive, ractive ] );
			// t.equal( fixture.innerHTML, '13' );


		});


	}

});
