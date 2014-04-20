define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'elements' );

		test( 'Input with uppercase tag name binds correctly', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<input value="{{val}}">',
				data: { val: 'foo' }
			});

			//ractive.set('val', 'bar');
			t.equal( fixture.innerHTML  ,  '<input>bar');
		});

	};

});