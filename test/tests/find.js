define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'ractive.find()/findAll()' );

		test( 'find() works with a string-only template', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<p>foo</p><p>bar</p>'
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'foo' );
		});

		test( 'find() works with a template containing mustaches', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p><p>{{bar}}</p>',
				data: { foo: 'one', bar: 'two' }
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'one' );
		});

		test( 'find() works with nested elements', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<div class="outer"><div class="inner"><p>{{foo}}</p><p>{{bar}}</p></div></div>',
				data: { foo: 'one', bar: 'two' }
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'one' );
		});

		test( 'findAll() gets an array of all nodes matching a selector', function ( t ) {
			var ractive, divs;

			ractive = new Ractive({
				el: fixture, 
				template: '<div><div><div>{{foo}}</div></div></div>'
			});

			divs = ractive.findAll( 'div' );
			t.equal( divs.length, 3 );
		});

		test( 'findAll() with { live: true } gets an updating array of all nodes matching a selector', function ( t ) {
			var ractive, lis;

			ractive = new Ractive({
				el: fixture, 
				template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
				data: {
					items: [ 'a', 'b', 'c' ]
				}
			});

			lis = ractive.findAll( 'li', { live: true });
			t.equal( lis.length, 3 );

			ractive.get( 'items' ).push( 'd' );
			t.equal( lis.length, 4 );
		});

		test( 'A live query maintains the correct sort order after a merge operation', function ( t ) {
			var ractive, lis, getHtml;

			ractive = new Ractive({
				el: fixture, 
				template: '<ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>',
				data: {
					items: [ 'a', 'b', 'c', 'd' ]
				}
			});

			getHtml = function ( node ) {
				return node.innerHTML;
			};

			lis = ractive.findAll( 'li', { live: true });
			t.deepEqual( lis.map( getHtml ), [ 'a', 'b', 'c', 'd' ] );
			console.log( lis.map( getHtml ) );

			ractive.merge( 'items', [ 'c', 'b', 'a', 'd' ] );
			t.deepEqual( lis.map( getHtml ), [ 'c', 'b', 'a', 'd' ] );
			console.log( lis.map( getHtml ) );

			window.lis = lis;
		});


		// TODO add tests (and add the functionality)...
		// * cancelling a live query (also, followed by teardown)
		// * components
		// * a load of other stuff
		
	};

});