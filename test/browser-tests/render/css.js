import { test } from 'qunit';
import getComputedStylePolyfill from 'utils/getComputedStyle';

const getComputedStyle = window.getComputedStyle || getComputedStylePolyfill;

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
				<div outro='wait'>
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
