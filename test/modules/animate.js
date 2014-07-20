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

	};

});
