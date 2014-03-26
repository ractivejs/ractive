define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'ractive.reset()' );

		test( 'ractive.reset() works', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{one}}{{two}}{{three}}',
				data: { one: 1, two: 2, three: 3 }
			});

			ractive.reset({ two: 4 });
			t.htmlEqual( fixture.innerHTML, '4' );
		});

	};

});
