define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'elements' );

		test( 'Input with uppercase tag name binds correctly', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: "<INPUT value='{{val}}'>{{val}}",
				data: { val: 'foo' }
			});

			ractive.find('input').value = 'bar';
			ractive.updateModel()
			t.equal( fixture.innerHTML  ,  '<input>bar');

		});

	};

});