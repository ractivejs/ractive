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

		test( 'Elements with id are registered and unregistered with ractive.nodes', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: "{{#hasP}}<p id='foo'></p>{{/}}",
				data: {
					hasP: true
				}
			});

			t.equal( ractive.nodes.foo, ractive.find('p') );
			ractive.set( 'hasP', false );
			t.ok( !ractive.nodes.foo );
		});

		test( 'Elements with dynamic id is unregistered with ractive.nodes on change', function ( t ) {
			var p, ractive = new Ractive({
				el: fixture,
				template: "<p id='{{id}}'></p>",
				data: {
					id: 'foo'
				}
			});

			p = ractive.find('p')
			t.equal( ractive.nodes.foo, p );
			ractive.set( 'id', 'bar' );
			t.ok( !ractive.nodes.foo );
			t.equal( ractive.nodes.bar, p );
		});
	};
});
