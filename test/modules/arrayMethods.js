define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, List, baseItems;

		module( 'Array methods' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		List = Ractive.extend({
			template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
			modifyArrays: false
		});

		baseItems = [ 'alice', 'bob', 'charles' ];

		test( 'ractive.push()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			ractive.push( 'items', 'dave' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
		});

		test( 'ractive.pop()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			ractive.pop( 'items' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
		});

		test( 'ractive.shift()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			ractive.shift( 'items' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
		});

		test( 'ractive.unshift()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			ractive.unshift( 'items', 'dave');
			t.htmlEqual( fixture.innerHTML, '<ul><li>dave</li><li>alice</li><li>bob</li><li>charles</li></ul>' );
		});

		test( 'ractive.splice()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			ractive.splice( 'items', 1, 1, 'dave', 'eric' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>dave</li><li>eric</li><li>charles</li></ul>' );
		});

		test( 'ractive.reverse()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			ractive.reverse( 'items' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>charles</li><li>bob</li><li>alice</li></ul>' );
		});

		test( 'ractive.sort()', function ( t ) {
			var items, ractive;

			items = baseItems.slice();

			ractive = new List({
				el: fixture,
				data: { items: items }
			});

			ractive.sort( 'items', function ( a, b ) {
				return a.length - b.length;
			});
			t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>alice</li><li>charles</li></ul>' );
		});

	};

});
