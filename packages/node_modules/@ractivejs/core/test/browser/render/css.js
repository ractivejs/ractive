import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'render/css.js' );

	const getComputedStyle = window.getComputedStyle;

	// normalise colours
	const hexCodes = {
		red: '#FF0000',
		green: '#008000',
		blue: '#0000FF',
		black: '#000000'
	};

	function getHexColor ( node ) {
		let color = getComputedStyle( node ).color;

		const match = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec( color );
		if ( match ) {
			color = '#' + toHex( match[1] ) + toHex( match[2] ) + toHex( match[3] );
		} else {
			color = hexCodes[ color ] || color;
		}

		return color;
	}

	function toHex ( str ) {
		let hex = ( +str ).toString(16);
		if ( hex.length < 2 ) hex = '0' + hex;

		return hex.toUpperCase();
	}

	test( 'CSS is applied to components', t => {
		const Widget = Ractive.extend({
			template: '<p>foo</p>',
			css: 'p { color: red; }'
		});

		const ractive = new Widget({
			el: fixture
		});

		t.equal( getHexColor( ractive.find( 'p' ) ), hexCodes.red );
	});

	test( 'CSS is encapsulated', t => {
		const Widget = Ractive.extend({
			template: '<p>red</p>',
			css: 'p { color: red; }'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<p>black</p><Widget/>',
			components: { Widget }
		});

		const paragraphs = ractive.findAll( 'p' );

		t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
		t.equal( getHexColor( paragraphs[1] ), hexCodes.red );
	});

	test( 'CSS encapsulation transformation is optional', t => {
		const done = t.async();

		const Widget = Ractive.extend({
			template: '<p class="unencapsulated">red</p>',
			css: '.unencapsulated { color: red; }',
			noCssTransform: true
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<p class="unencapsulated">red</p><Widget/>',
			components: { Widget }
		});

		const paragraphs = ractive.findAll( 'p' );

		t.equal( getHexColor( paragraphs[0] ), hexCodes.red );
		t.equal( getHexColor( paragraphs[1] ), hexCodes.red );

		// we need to clean up after ourselves otherwise the global styles remain in the DOM!
		ractive.teardown().then( done );
	});

	test( 'Comments do not break transformed CSS', t => {
		const Widget = Ractive.extend({
			template: '<p>foo</p>',
			css: '/*p { color: red; }*/ p { color: blue; }'
		});

		const ractive = new Widget({
			el: fixture
		});

		t.equal( getHexColor( ractive.find( 'p' ) ), hexCodes.blue );
	});

	test( 'Multiple pseudo-selectors work', t => {
		const Widget = Ractive.extend({
			template: '<div><p>blue</p><p>black</p></div>',
			css: 'p:first-child:nth-child(1) { color: blue; }'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<div><p>black</p><p>black</p></div><Widget/>',
			components: { Widget }
		});

		const paragraphs = ractive.findAll( 'p' );

		t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
		t.equal( getHexColor( paragraphs[1] ), hexCodes.black );
		t.equal( getHexColor( paragraphs[2] ), hexCodes.blue );
		t.equal( getHexColor( paragraphs[3] ), hexCodes.black );
	});

	test( 'Combinators work', t => {
		const Widget = Ractive.extend({
			template: '<div><p>black</p><p>green</p></div>',
			css: 'p + p { color: green; }'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<div><p>black</p><p>black</p></div><Widget/>',
			components: { Widget }
		});

		const paragraphs = ractive.findAll( 'p' );

		t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
		t.equal( getHexColor( paragraphs[1] ), hexCodes.black );
		t.equal( getHexColor( paragraphs[2] ), hexCodes.black );
		t.equal( getHexColor( paragraphs[3] ), hexCodes.green );
	});

	test( 'Media queries work', t => {
		const Widget = Ractive.extend({
			template: '<p>red</p>',
			css: 'p { color: blue } @media screen and (max-width: 99999px) { p { color: red; } }'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<p>black</p><Widget/>',
			components: { Widget }
		});

		const paragraphs = ractive.findAll( 'p' );

		t.equal( getHexColor( paragraphs[0] ), hexCodes.black );
		t.equal( getHexColor( paragraphs[1] ), hexCodes.red );
	});

	test( 'Multiple inheritance doesn\'t break css', t => {
		const C = Ractive.extend({
			css: 'p { color: red; }',
			template: '<p>Hi!</p>'
		});

		const D = C.extend({});

		const d = new D({
			el: fixture
		});

		const paragraph = d.findAll( 'p' )[0];

		t.equal( getHexColor( paragraph ), hexCodes.red );
	});

	test( 'nth-child selectors work', t => {
		const ZebraList = Ractive.extend({
			css: 'li { color: green; } li:nth-child(2n+1) { color: red; }',
			template: `
				<ul>
					{{#each items}}
						<li>{{this}}</li>
					{{/each}}
				</ul>`
		});

		const ractive = new ZebraList({
			el: fixture,
			data: { items: [ 'a', 'b', 'c', 'd', 'e' ] }
		});

		const lis = ractive.findAll( 'li' );

		t.equal( getHexColor( lis[0] ), hexCodes.red );
		t.equal( getHexColor( lis[1] ), hexCodes.green );
		t.equal( getHexColor( lis[2] ), hexCodes.red );
		t.equal( getHexColor( lis[3] ), hexCodes.green );
		t.equal( getHexColor( lis[4] ), hexCodes.red );
	});

	test( 'Components forward encapsulation instructions to top-level components in their own templates', t => {
		const Inner = Ractive.extend({
			template: '<p>red, bold, italic</p>',
			css: 'p { color: red; }'
		});

		const Middle = Ractive.extend({
			template: '<Inner/>',
			css: 'p { font-weight: bold; }',
			components: { Inner }
		});

		const Outer = Ractive.extend({
			template: '<Middle/>',
			css: 'p { font-style: italic; }',
			components: { Middle }
		});

		const ractive = new Outer({
			el: fixture
		});

		const p = ractive.find( 'p' );
		const style = getComputedStyle( p );

		t.equal( getHexColor( p ), hexCodes.red );
		t.ok( style.fontWeight === 'bold' || style.fontWeight === 700 || style.fontWeight === '700' );
		t.equal( style.fontStyle, 'italic' );
	});

	test( 'Yielded content gets encapsulated styles', t => {
		const Wrapper = Ractive.extend({
			template: `<div class='blue'>{{yield}}</div>`,
			css: '.blue { color: blue; }'
		});

		const Widget = Ractive.extend({
			template: '<Wrapper><p>this should be blue</p></Wrapper>',
			css: 'p { font-family: "Comic Sans MS"; }',
			components: { Wrapper }
		});

		const ractive = new Widget({ el: fixture });

		const p = ractive.find( 'p' );
		const style = getComputedStyle( p );

		t.equal( getHexColor( p ), hexCodes.blue );
		t.ok( /Comic Sans MS/.test( style.fontFamily ) );
	});

	test( 'Components retain their encapsulated CSS until they are detached', t => {
		const done = t.async();

		const Widget = Ractive.extend({
			template: '<p>some red text</p>',
			css: 'p { color: red; }'
		});

		let complete;

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#if show}}
					<div wait-out>
						<Widget/>
					</div>
				{{/if}}`,
			data: { show: true },
			components: { Widget },
			transitions: {
				wait ( t ) {
					complete = t.complete;
				}
			}
		});

		const p = ractive.find( 'p' );
		ractive.set( 'show', false );

		setTimeout( () => {
			t.equal( getHexColor( p ), hexCodes.red );
			complete();
			done();
		});
	});

	test( 'data-ractive-css only gets applied to one level of elements', t => {
		const Widget = Ractive.extend({
			template: '<div><p></p></div>',
			css: 'div {}'
		});

		const ractive = new Widget({ el: fixture });

		t.ok( ractive.find( 'div' ).hasAttribute( 'data-ractive-css' ) );
		t.ok( !ractive.find( 'p' ).hasAttribute( 'data-ractive-css' ) );
	});

	test( 'top-level elements inside each blocks get encapsulated styles', t => {
		const Widget = Ractive.extend({
			template: `
				<div class='one'>a</div>

				{{#each list}}
					<div class='two'>{{this}}</div>
				{{/each}}`,
			css: `
				div { font-weight: 900; }
				.one { color: red; }
				.two { color: blue; }`
		});

		const ractive = new Widget({
			el: fixture,
			data: {
				list: [ 1 ]
			}
		});

		const one = ractive.find( '.one' );
		const two = ractive.find( '.two' );

		t.equal( getComputedStyle( one ).fontWeight, 900 );
		t.equal( getComputedStyle( two ).fontWeight, 900 );

		t.equal( getHexColor( one ), hexCodes.red );
		t.equal( getHexColor( two ), hexCodes.blue );
	});

	test( 'Multiline comments are removed (#2683)', t => {
		const Widget = Ractive.extend({
			template: '<p>foo</p>',
			css: '/*p \n{ color: red; }*/ p { color: blue; }'
		});

		const ractive = new Widget({
			el: fixture
		});

		t.equal( getHexColor( ractive.find( 'p' ) ), hexCodes.blue );
	});

	test( 'Attribute selectors are handled correctly (#2778)', t => {
		const Widget = Ractive.extend({
			template: '<p data-foo="https://\'\']:">foo</p>',
			css: 'p[data-foo=\'https://\\\'\\\']:\'] { color: blue; }'
		});

		const ractive = new Widget({
			el: fixture
		});

		t.equal( getHexColor( ractive.find( 'p' ) ), hexCodes.blue );
	});

	test( `components should output css scoping ids with toHTML (#2709)`, t => {
		const cmp = new (Ractive.extend({
			template: '<div />',
			cssId: 'my-nifty-cmp',
			css: 'div { color: red }'
		}));

		t.equal( cmp.toHTML(), '<div data-ractive-css="{my-nifty-cmp}"></div>' );
		t.ok( ~cmp.toCSS().indexOf( 'my-nifty-cmp' ) );
	});

	test( `using 'from' and 'to' in keyframe declarations works (#2854)`, t => {
		const cmp = new (Ractive.extend({
			el: fixture,
			template: '<p class="blue">foo</p><p class="red">bar</p>',
			css: '.blue { color: blue } @keyframes someAnimation { from { transform: scale3d(1.5,1.5,1) rotate(0deg); } } .red { color: red }'
		}));

		t.equal( getHexColor( cmp.find( '.blue' ) ), hexCodes.blue );
		t.equal( getHexColor( cmp.find( '.red' ) ), hexCodes.red );
		t.ok( ~cmp.toCSS().indexOf( 'someAnimation { from { transform: scale3d(1.5,1.5,1) rotate(0deg); } }' ) );
	});

	test( `css can be loaded from an element, and id, or a selector too (#2511)`, t => {
		const script = document.createElement( 'script' );
		script.setAttribute( 'type', 'text/css' );
		script.setAttribute( 'id', 'foo-css' );
		const prop = 'textContent' in script ? 'textContent' : 'innerHTML';
		script[prop] = '.blue { color: blue; }';
		document.head.appendChild( script );

		const cmp1 = Ractive.extend({
			css: script
		});
		const cmp2 = Ractive.extend({
			css: 'foo-css'
		});
		const cmp3 = Ractive.extend({
			css: '#foo-css'
		});

		document.head.removeChild( script );

		t.ok( cmp1.prototype.cssId );
		t.ok( cmp2.prototype.cssId );
		t.ok( cmp3.prototype.cssId );
	});

	test( `css that has no curlies and also isn't a valid selector should not throw (#3005)`, t => {
		t.expect( 0 );

		const cmp = Ractive.extend({
			css: '/* not a valid selector */',
			template: ''
		});

		new cmp({
			target: fixture
		});
	});
}
