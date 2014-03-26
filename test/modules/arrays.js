define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, List, baseItems;

		module( 'Arrays' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		List = Ractive.extend({
			template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>'
		});

		baseItems = [ 'alice', 'bob', 'charles' ];

		test( 'array.push()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			items.push( 'dave' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
		});

		test( 'array.pop()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			items.pop();
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
		});

		test( 'array.shift()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			items.shift();
			t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
		});

		test( 'array.unshift()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			items.unshift( 'dave');
			t.htmlEqual( fixture.innerHTML, '<ul><li>dave</li><li>alice</li><li>bob</li><li>charles</li></ul>' );
		});

		test( 'array.splice()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			items.splice( 1, 1, 'dave', 'eric' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>dave</li><li>eric</li><li>charles</li></ul>' );
		});

		test( 'Regression test for #425', function ( t ) {
			var items, ractive;

			items = [];

			ractive = new Ractive({
				el: fixture,
				template: '{{#items.length < limit}}<p>{{items.length}} / {{limit}}</p>{{/items.length < limit}}',
				data: {
					items: items,
					limit: 3
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>0 / 3</p>' );

			items.push( 'x', 'y' );
			t.htmlEqual( fixture.innerHTML, '<p>2 / 3</p>' );

			items.push( 'z' );
			t.htmlEqual( fixture.innerHTML, '' );
		});

	};

});
