define([ 'Ractive', 'legacy' ], function ( Ractive, legacy ) {

	'use strict';

	Ractive = Ractive['default'] || Ractive;

	return function () {

		var fixture, hexCodes, getComputedStyle;

		getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;

		module( 'CSS encapsulation' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		// normalise colours
		hexCodes = {
			red: '#FF0000',
			green: '#008000',
			blue: '#0000FF',
			black: '#000000'
		};

		function getHexColor ( node ) {
			var color, match;

			color = getComputedStyle( node ).color;

			match = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec( color );
			if ( match ) {
				color = '#' + toHex( match[1] ) + toHex( match[2] ) + toHex( match[3] );
			} else {
				color = hexCodes[ color ] || color;
			}

			return color;
		}

		function toHex ( str ) {
			var num = +str, hex;

			hex = num.toString(16);
			if ( hex.length < 2 ) {
				hex = '0' + hex;
			}

			return hex.toUpperCase();
		}

		test( 'CSS is applied to components', function ( t ) {
			var Widget, ractive;

			Widget = Ractive.extend({
				template: '<p>foo</p>',
				css: 'p { color: red; }'
			});

			ractive = new Widget({
				el: fixture
			});

			t.equal( getHexColor( ractive.find( 'p' ) ), hexCodes.red );
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

			t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
			t.equal( getHexColor( paragraphs[1] ), hexCodes.red );
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

			t.equal( getHexColor( paragraphs[0] ), hexCodes.red );
			t.equal( getHexColor( paragraphs[1] ), hexCodes.red );

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

			t.equal( getHexColor( ractive.find( 'p' ) ), hexCodes.blue );
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

			t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
			t.equal( getHexColor( paragraphs[1] ), hexCodes.black );
			t.equal( getHexColor( paragraphs[2] ), hexCodes.blue );
			t.equal( getHexColor( paragraphs[3] ), hexCodes.black );
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

			t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
			t.equal( getHexColor( paragraphs[1] ), hexCodes.black );
			t.equal( getHexColor( paragraphs[2] ), hexCodes.black );
			t.equal( getHexColor( paragraphs[3] ), hexCodes.green );
		});

		test( 'Media queries work', function ( t ) {
			var Widget, ractive, paragraphs;

			Widget = Ractive.extend({
				template: '<p>red</p>',
				css: 'p { color: blue } @media screen and (max-width: 99999px) { p { color: red; } }'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>black</p><widget/>',
				components: {
					widget: Widget
				}
			});

			paragraphs = ractive.findAll( 'p' );

			t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
			t.equal( getHexColor( paragraphs[1] ), hexCodes.red );
		});

		test( 'Multiple inheritance doesn\'t break css', function ( t ) {
			var C, D, d, paragraph;

			C = Ractive.extend({
				css: 'p { color: red; }',
				template: '<p>Hi!</p>'
			});

			D = C.extend({});

			d = new D({
				el: fixture
			});

			paragraph = d.findAll( 'p' )[0];

			t.equal( getHexColor( paragraph ), hexCodes.red );
		});

		test( 'nth-child selectors work', function ( t ) {
			var ZebraList, ractive, lis;

			ZebraList = Ractive.extend({
				css: 'li { color: green; } li:nth-child(2n+1) { color: red; }',
				template: `
					<ul>
						{{#each items}}
							<li>{{this}}</li>
						{{/each}}
					</ul>`
			});

			ractive = new ZebraList({
				el: fixture,
				data: { items: [ 'a', 'b', 'c', 'd', 'e' ] }
			});

			lis = ractive.findAll( 'li' );
			t.equal( getHexColor( lis[0] ), hexCodes.red );
			t.equal( getHexColor( lis[1] ), hexCodes.green );
			t.equal( getHexColor( lis[2] ), hexCodes.red );
			t.equal( getHexColor( lis[3] ), hexCodes.green );
			t.equal( getHexColor( lis[4] ), hexCodes.red );
		});

	};

});
