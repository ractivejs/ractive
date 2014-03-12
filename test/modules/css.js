define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, colorTester, colors;

		module( 'CSS encapsulation' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		// normalise colours
		colorTester = document.createElement( 'div' );
		document.getElementsByTagName( 'body' )[0].appendChild( colorTester );

		colors = {};
		[ 'red', 'green', 'blue', 'black' ].forEach( function ( color ) {
			colors[ color ] = normaliseColor( color );
		});

		test( 'CSS is applied to components', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '<p>foo</p>',
				css: 'p { color: red; }'
			});

			ractive = new Widget({
				el: fixture
			});

			t.equal( getComputedStyle( ractive.find( 'p' ) ).color, colors.red );
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

			t.equal( getComputedStyle( paragraphs[0] ).color, colors.black );
			t.equal( getComputedStyle( paragraphs[1] ).color, colors.red );
		});

		asyncTest( 'CSS encapsulation transformation is optional', function ( t ) {
			var Widget, ractive, paragraphs;

			Widget = Ractive.extend({
				template: '<p>red</p>',
				css: 'p { color: red; }',
				noCssTransform: true
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>red</p><widget/>',
				components: {
					widget: Widget
				}
			});

			paragraphs = ractive.findAll( 'p' );

			t.equal( getComputedStyle( paragraphs[0] ).color, colors.red );
			t.equal( getComputedStyle( paragraphs[1] ).color, colors.red );

			// we need to clean up after ourselves otherwise the global styles remain in the DOM!
			ractive.teardown().then( start );
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

			t.equal( getComputedStyle( ractive.find( 'p' ) ).color, colors.blue );
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

			t.equal( getComputedStyle( paragraphs[0] ).color, colors.black );
			t.equal( getComputedStyle( paragraphs[1] ).color, colors.black );
			t.equal( getComputedStyle( paragraphs[2] ).color, colors.blue );
			t.equal( getComputedStyle( paragraphs[3] ).color, colors.black );
		});

		test( 'Combinators work', function ( t ) {
			var Widget, ractive, paragraphs;

			Widget = Ractive.extend({
				template: '<div><p>black</p><p>green</p></div>',
				css: 'p + p { color: green; }'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<div><p>black</p><p>black</p></div><widget/>',
				components: { widget: Widget }
			});

			paragraphs = ractive.findAll( 'p' );

			t.equal( getComputedStyle( paragraphs[0] ).color, colors.black );
			t.equal( getComputedStyle( paragraphs[1] ).color, colors.black );
			t.equal( getComputedStyle( paragraphs[2] ).color, colors.black );
			t.equal( getComputedStyle( paragraphs[3] ).color, colors.green );
		});


		function normaliseColor ( color ) {
			colorTester.style.color = color;
			return getComputedStyle( colorTester ).color;
		}
	};

});
