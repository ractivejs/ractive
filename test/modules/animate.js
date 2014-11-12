define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture;

		module( 'ractive.animate()' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'Values that cannot be interpolated change to their final value immediately', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<p>{{name}}</p>',
				data: {
					name: 'foo'
				}
			});

			ractive.animate( 'name', 'bar' );
			t.htmlEqual( fixture.innerHTML, '<p>bar</p>' );
		});

		asyncTest( 'ractive.animate() returns a promise that resolves when the animation completes (#1047)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{~~foo}}',
				data: { foo: 0 }
			});

			ractive.animate( 'foo', 100, { duration: 10 }).then( function () {
				t.htmlEqual( fixture.innerHTML, '100' );
				QUnit.start();
			});
		});

		asyncTest( 'ractive.animate() returns a promise that resolves when the animation completes when using a map of values (#1047)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{~~foo}}',
				data: { foo: 0 }
			});

			ractive.animate({ foo: 100 }, { duration: 10 }).then( function () {
				t.htmlEqual( fixture.innerHTML, '100' );
				QUnit.start();
			});
		});


		asyncTest( 'error in callback sent to console', function ( t ) {
			var ractive, error = console.error;

			expect( 1 )

			console.error = function ( err ) {
				t.equal( err, 'evil animate' );
				console.error = error;
				QUnit.start();
			}

			ractive = new Ractive({
				el: fixture,
				template: '{{~~foo}}',
				data: { foo: 0 }
			});

			ractive.animate({ foo: 100 }, { duration: 10, complete: function () {
				throw 'evil animate';
			} });
		});

	};

});
