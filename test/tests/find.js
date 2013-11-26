define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'ractive.find()/findAll()' );

		test( 'Find works with a string-only template', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<p>foo</p><p>bar</p>'
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'foo' );
		});

		test( 'Find works with a template containing mustaches', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p><p>{{bar}}</p>',
				data: { foo: 'one', bar: 'two' }
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'one' );
		});

		test( 'Find works with nested elements', function ( t ) {
			var ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<div class="outer"><div class="inner"><p>{{foo}}</p><p>{{bar}}</p></div></div>',
				data: { foo: 'one', bar: 'two' }
			});

			t.ok( ractive.find( 'p' ).innerHTML === 'one' );
		});
		
	};

});