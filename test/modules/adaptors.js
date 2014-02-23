define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	window.Ractive = Ractive;

	return function () {

		var fixture;

		module( 'Adaptors' );

		// setup
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'Adaptors can change data as it is .set() (#442)', function ( t ) {
			var LowerCaseString, adaptor, foo, ractive;

			LowerCaseString = function ( str ) {
				this.callbacks = [];
				this.set( str );
			};

			LowerCaseString.prototype = {
				get: function () {
					return this.str;
				},
				set: function ( str ) {
					var i;

					this.str = str.toLowerCase();

					i = this.callbacks.length;
					while ( i-- ) {
						this.callbacks( this.str );
					}
				}
			};

			adaptor = {
				filter: function ( object ) {
					return object instanceof LowerCaseString;
				},
				wrap: function ( ractive, object, keypath ) {
					var changeHandler;

					changeHandler = function () {
						ractive.set( keypath, object.str );
					};

					return {
						get: function () {
							return object.str;
						},
						teardown: function () {
							var index = object.callbacks.indexOf( changeHandler );
							object.callbacks.splice( index, 1 );
						},
						reset: function ( value ) {
							object.set( value );
						}
					};
				}
			};

			foo = new LowerCaseString( 'BAR' );

			ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: {
					foo: foo
				},
				adapt: [ adaptor ]
			});

			t.htmlEqual( fixture.innerHTML, 'bar' );

			foo.set( 'BAZ' );
			t.htmlEqual( fixture.innerHTML, 'baz' );
		});

	};

});
