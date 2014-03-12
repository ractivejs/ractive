define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture;

		module( 'CSS encapsulation' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'CSS is applied to components', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '<p>foo</p>',
				css: 'p { color: red; }'
			});

			ractive = new Widget({
				el: fixture
			});

			t.equal( getComputedStyle( ractive.find( 'p' ) ).color, 'rgb(255, 0, 0)' );
		});

		test( 'CSS is encapsulated', function ( t ) {
			var Widget, ractive, paragraphs;

			Widget = Ractive.extend({
				template: '<p>red</p>',
				css: 'p { color: red; }'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>black</p><widget/>',
				components: {
					widget: Widget
				}
			});

			paragraphs = ractive.findAll( 'p' );

			t.equal( getComputedStyle( paragraphs[0] ).color, 'rgb(0, 0, 0)' );
			t.equal( getComputedStyle( paragraphs[1] ).color, 'rgb(255, 0, 0)' );
		});

		test( 'Comments do not break transformed CSS', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '<p>foo</p>',
				css: '/*p { color: red; }*/ p { color: blue; }'
			});

			ractive = new Widget({
				el: fixture
			});

			t.equal( getComputedStyle( ractive.find( 'p' ) ).color, 'rgb(0, 0, 255)' );
		});

		test( 'Multiple pseudo-selectors work', function ( t ) {
			var Widget, ractive, paragraphs;

			Widget = Ractive.extend({
				template: '<div><p>blue</p><p>black</p></div>',
				css: 'p:first-child:nth-child(1) { color: blue; }'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<div><p>black</p><p>black</p></div><widget/>',
				components: { widget: Widget }
			});

			paragraphs = ractive.findAll( 'p' );

			t.equal( getComputedStyle( paragraphs[0] ).color, 'rgb(0, 0, 0)' );
			t.equal( getComputedStyle( paragraphs[1] ).color, 'rgb(0, 0, 0)' );
			t.equal( getComputedStyle( paragraphs[2] ).color, 'rgb(0, 0, 255)' );
			t.equal( getComputedStyle( paragraphs[3] ).color, 'rgb(0, 0, 0)' );
		});

	};

});
