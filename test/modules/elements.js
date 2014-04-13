define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'elements' );

		test( 'option elements set select parent before initializing parent', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: 
					'<select>' +
					'{{#options}}' +
					'<option value="{{.}}" selected="{{.===selected}}">{{.}}</option>' +
					'{{/options}}' +
					'</select>',
				data: { 
					selected: 2,
					options: [1,2,3] 
				}
			});

			t.equal( ractive.find('select').value , 2 );
		});

	};

});