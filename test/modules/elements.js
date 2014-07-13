define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'elements' );

		test( 'option element with custom selected logic works without error and correctly', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: `
					<select>
						{{#options}}
							<option value="{{.}}" selected="{{.===selected}}">{{.}}</option>
						{{/options}}
					</select>`,
				data: {
					selected: 2,
					options: [1,2,3]
				}
			});

			t.equal( ractive.find('select').value , 2 );
		});

		test( 'Input with uppercase tag name binds correctly', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: "<INPUT value='{{val}}'>{{val}}",
				data: { val: 'foo' }
			});

			ractive.find('input').value = 'bar';
			ractive.updateModel();
			t.htmlEqual( fixture.innerHTML, '<input>bar' );
		});
	};
});
