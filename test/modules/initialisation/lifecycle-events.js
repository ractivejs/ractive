define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture

		module( 'Lifecycle events' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		function getTest ( fired, html, fn ) {

			return function test( Constructor, options = {} ) {

				options.el = fixture;

				var ractive = new Constructor(options),
					widget = ractive.findComponent( 'widget' ),
					expected = fn( ractive, widget );

				deepEqual( fired, expected );
				equal( fixture.innerHTML, html );

				ractive.teardown();
				fired.splice(0, fired.length);
			}
		}


		test( 'construct', t => {

			expect( 4 )

			var fired = [], options = {
				construct: function ( options ) {
					fired.push( this );
					options.template = '{{foo}}';
					options.data = { foo: 'bar' };
				}
			};

			var test = getTest( fired, 'bar', ( ractive, widget ) => [ widget || ractive ] );

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

			var fired = []

			function getOptions(){
				return {
					config: function () {
						fired.push( this );
						this.data.foo++;
					},
					template: '{{foo}}',
					data: { foo: 1 }
				};
			}

			var test = getTest( fired, '2', ( ractive, widget ) => widget ? [ ractive, widget ] : [ ractive ]  );

			test( Ractive, getOptions() );
			test( Ractive.extend( getOptions() ) );

			test( Ractive, {
				el: fixture,
				template: '<widget/>',
				config: function () {
					fired.push( this );
				},
				components: {
					widget: Ractive.extend( getOptions() )
				}
			})

			var ractive = new (Ractive.extend( getOptions() ) )( {
				el: fixture,
				config: function () {
					fired.push( this );
					this.data = { foo: 12 };
					this._super();
				}
			});

			t.deepEqual( fired, [ ractive, ractive ] );
			t.equal( fixture.innerHTML, '13' );


		});


	}

});
