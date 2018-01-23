import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'render/enhance.js' );

	test( 'Cannot use append and enhance at the same time', t => {
		t.throws( () => {
			new Ractive({
				enhance: true,
				append: true
			});
		}, /Cannot use append and enhance at the same time/ );
	});

	test( 'basic progressive enhancement', t => {
		fixture.innerHTML = '<p></p>';
		const p = fixture.querySelector( 'p' );

		const ractive = new Ractive({
			el: fixture,
			template: '<p></p>',
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<p></p>' );
		t.strictEqual( p, ractive.find( 'p' ) );
	});

	test( 'progressive enhancement for svg elements', t => {
		/*
		 * list is grabbed from https://developer.mozilla.org/en-US/docs/Web/SVG/Element using the following code:
		 *
		 * Array.prototype.slice.call( document.getElementById( 'SVG_elements' ).nextElementSibling.querySelectorAll( 'code' )).map( el => el.innerText )
		 */
		const listOfSvgElements = [ '<a>', '<altGlyph>', '<altGlyphDef>', '<altGlyphItem>', '<animate>', '<animateColor>', '<animateMotion>', '<animateTransform>', '<circle>', '<clipPath>', '<color-profile>', '<cursor>', '<defs>', '<desc>', '<ellipse>', '<feBlend>', '<feColorMatrix>', '<feComponentTransfer>', '<feComposite>', '<feConvolveMatrix>', '<feDiffuseLighting>', '<feDisplacementMap>', '<feDistantLight>', '<feFlood>', '<feFuncA>', '<feFuncB>', '<feFuncG>', '<feFuncR>', '<feGaussianBlur>', '<feImage>', '<feMerge>', '<feMergeNode>', '<feMorphology>', '<feOffset>', '<fePointLight>', '<feSpecularLighting>', '<feSpotLight>', '<feTile>', '<feTurbulence>', '<filter>', '<font>', '<font-face>', '<font-face-format>', '<font-face-name>', '<font-face-src>', '<font-face-uri>', '<foreignObject>', '<g>', '<glyph>', '<glyphRef>', '<hkern>', '<image>', '<line>', '<linearGradient>', '<marker>', '<mask>', '<metadata>', '<missing-glyph>', '<mpath>', '<path>', '<pattern>', '<polygon>', '<polyline>', '<radialGradient>', '<rect>', '<script>', '<set>', '<stop>', '<style>', '<svg>', '<switch>', '<symbol>', '<text>', '<textPath>', '<title>', '<tref>', '<tspan>', '<use>', '<view>', '<vkern>' ];
		const allAvailableSvgElements = '<svg>' + listOfSvgElements.map( el => `${el}${el.replace('<', '</')}` ).join( '' ) + '</svg>';

		fixture.innerHTML = allAvailableSvgElements;
		const svg = fixture.querySelector( 'svg' );

		const ractive = new Ractive({
			el: fixture,
			template: allAvailableSvgElements,
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, allAvailableSvgElements );
		t.strictEqual( svg, ractive.find( 'svg' ) );
	});

	test( 'missing nodes are added', t => {
		fixture.innerHTML = '<p></p>';
		const p = fixture.querySelector( 'p' );

		const ractive = new Ractive({
			el: fixture,
			template: '<p></p><p></p>',
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<p></p><p></p>' );
		t.strictEqual( p, ractive.find( 'p' ) );
	});

	test( 'excess nodes are removed', t => {
		fixture.innerHTML = '<p></p><p></p>';
		const ps = fixture.querySelectorAll( 'p' );

		const ractive = new Ractive({
			el: fixture,
			template: '<p></p>',
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<p></p>' );
		t.strictEqual( ps[0], ractive.find( 'p' ) );
		t.ok( ps[1].parentNode !== fixture );
	});

	test( 'nested elements', t => {
		const html = '<div><p><strong>it works!</strong></p></div>';
		fixture.innerHTML = html;

		const div = fixture.querySelector( 'div' );
		const p = fixture.querySelector( 'p' );
		const strong = fixture.querySelector( 'strong' );

		const ractive = new Ractive({
			el: fixture,
			template: html,
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, html );
		t.strictEqual( div, ractive.find( 'div' ) );
		t.strictEqual( p, ractive.find( 'p' ) );
		t.strictEqual( strong, ractive.find( 'strong' ) );
	});

	test( 'attributes are added/removed as appropriate', t => {
		fixture.innerHTML = '<button disabled data-live="false"></button>';
		const button = fixture.querySelector( 'button' );

		const ractive = new Ractive({
			el: fixture,
			template: '<button class="live"></button>',
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<button class="live"></button>' );
		t.strictEqual( button, ractive.find( 'button' ) );
		t.ok( !button.disabled );
	});

	test( 'attributes are removed if none exist in template', t => {
		fixture.innerHTML = `<button disabled>don't click me</button>`;
		const button = fixture.querySelector( 'button' );

		const ractive = new Ractive({
			el: fixture,
			template: '<button>do click me</button>',
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<button>do click me</button>' );
		t.strictEqual( button, ractive.find( 'button' ) );
		t.ok( !button.disabled );
	});

	test( 'redundant classes are removed', t => {
		fixture.innerHTML = '<div class="someCls someClsToRemove">foo</div>';
		const div = fixture.querySelector( 'div' );

		const ractive = new Ractive({
			el: fixture,
			template: '<div class="someCls someClsToAdd">foo</div>',
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<div class="someCls someClsToAdd">foo</div>' );
		t.strictEqual( div, ractive.find( 'div' ) );
	});

	test( 'conditional sections inherit existing DOM', t => {
		fixture.innerHTML = '<p></p>';
		const p = fixture.querySelector( 'p' );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#if foo}}<p></p>{{/if}}',
			data: { foo: true },
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<p></p>' );
		t.strictEqual( p, ractive.find( 'p' ) );
	});

	test( 'list sections inherit existing DOM', t => {
		fixture.innerHTML = '<ul><li>a</li><li>b</li><li>c</li></ul>';
		const lis = fixture.querySelectorAll( 'li' );

		const ractive = new Ractive({
			el: fixture,
			template: `
				<ul>
					{{#each items}}<li>{{this}}</li>{{/each}}
				</ul>
			`,
			data: { items: [ 'a', 'b', 'c' ] },
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>a</li><li>b</li><li>c</li></ul>' );
		t.deepEqual( ractive.findAll( 'li' ), [].slice.call( lis ) );
	});

	test( 'interpolator in text sandwich', t => {
		fixture.innerHTML = '<p>before</p> hello, world! <p>after</p>';
		const ps = fixture.querySelectorAll( 'p' );

		const ractive = new Ractive({
			el: fixture,
			template: `<p>before</p> hello, {{name}}! <p>after</p>`,
			data: { name: 'world' },
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<p>before</p> hello, world! <p>after</p>' );
		t.deepEqual( ractive.findAll( 'p' ), [].slice.call( ps ) );
	});

	test( 'mismatched interpolator in text sandwich', t => {
		fixture.innerHTML = '<p>before</p> hello, world! <p>after</p>';
		const ps = fixture.querySelectorAll( 'p' );

		const ractive = new Ractive({
			el: fixture,
			template: `<p>before</p> hello, {{name}}! <p>after</p>`,
			data: { name: 'everybody' },
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<p>before</p> hello, everybody! <p>after</p>' );
		t.deepEqual( ractive.findAll( 'p' ), [].slice.call( ps ) );
	});

	test( 'partials', t => {
		fixture.innerHTML = '<p>I am a partial</p>';
		const p = fixture.querySelector( 'p' );

		const ractive = new Ractive({
			el: fixture,
			template: '{{>foo}}',
			partials: {
				foo: '<p>I am a partial</p>'
			},
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<p>I am a partial</p>' );
		t.strictEqual( ractive.find( 'p' ), p );
	});

	test( 'components', t => {
		fixture.innerHTML = '<ul><li>apples</li><li>oranges</li></ul>';
		const lis = fixture.querySelectorAll( 'li' );

		const Item = Ractive.extend({
			template: '<li>{{name}}</li>'
		});

		const ractive = new Ractive({
			el: fixture,
			components: { Item },
			template: `
				<ul>
					{{#each items}}<Item name='{{this}}'/>{{/each}}
				</ul>`,
			data: { items: [ 'apples', 'oranges' ] },
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>apples</li><li>oranges</li></ul>' );
		t.deepEqual( ractive.findAll( 'li' ), [].slice.call( lis ) );
	});

	test( 'two-way binding is initialised from DOM', t => {
		fixture.innerHTML = '<input value="it works"/>';
		const input = fixture.querySelector( 'input' );

		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{message}}"/>',
			enhance: true
		});

		t.strictEqual( ractive.get( 'message' ), 'it works' );
		t.strictEqual( ractive.find( 'input' ), input );
	});

	test( 'two-way binding with number input', t => {
		fixture.innerHTML = '<input type="number" value="42"/>';
		const input = fixture.querySelector( 'input' );

		const ractive = new Ractive({
			el: fixture,
			template: '<input type="number" value="{{answer}}"/>',
			enhance: true
		});

		t.strictEqual( ractive.get( 'answer' ), 42 );
		t.strictEqual( ractive.find( 'input' ), input );
	});

	test( 'two-way binding with range input', t => {
		fixture.innerHTML = '<input type="range" value="42"/>';
		const input = fixture.querySelector( 'input' );

		const ractive = new Ractive({
			el: fixture,
			template: '<input type="range" value="{{answer}}"/>',
			enhance: true
		});

		t.strictEqual( ractive.get( 'answer' ), 42 );
		t.strictEqual( ractive.find( 'input' ), input );
	});

	if ( !/phantomjs/i.test( navigator.userAgent ) ) { // gah
		test( 'two-way binding with single select', t => {
			fixture.innerHTML = `
				<select>
					<option>isomorphic</option>
					<option selected>universal</option>
					<option>who cares</option>
				</select>
			`;

			const ractive = new Ractive({
				el: fixture,
				template: `
					<select value='{{selected}}'>
						{{#each options}}<option value='{{this}}'>{{desc}}</option>{{/each}}
					</select>
				`,
				data: {
					options: [
						{ desc: 'isomorphic' },
						{ desc: 'universal' },
						{ desc: 'who cares' }
					]
				},
				enhance: true
			});

			t.equal( ractive.get( 'selected.desc' ), 'universal' );
		});

		test( 'two-way binding with multiple select', t => {
			fixture.innerHTML = `
				<select multiple>
					<option>isomorphic</option>
					<option selected>universal</option>
					<option selected>who cares</option>
				</select>
			`;

			const ractive = new Ractive({
				el: fixture,
				template: `
					<select multiple value='{{selected}}'>
						{{#each options}}<option value='{{this}}'>{{desc}}</option>{{/each}}
					</select>
				`,
				data: {
					options: [
						{ desc: 'isomorphic' },
						{ desc: 'universal' },
						{ desc: 'who cares' }
					]
				},
				enhance: true
			});

			t.deepEqual( ractive.get( 'selected' ), [
				{ desc: 'universal' },
				{ desc: 'who cares' }
			]);
		});
	}

	test( 'two-way binding with checkbox input', t => {
		fixture.innerHTML = `
			<input type='checkbox'>
			<input type='checkbox' checked>`;

		const ractive = new Ractive({
			el: fixture,
			template: `
				<input type='checkbox' checked='{{a}}'>
				<input type='checkbox' checked='{{b}}'>`,
			enhance: true
		});

		const inputs = ractive.findAll( 'input' );
		t.ok( !inputs[0].checked );
		t.ok(  inputs[1].checked );
	});

	test( 'two-way binding with checkbox name input', t => {
		fixture.innerHTML = `
			<input type='checkbox' value='foo' checked>
			<input type='checkbox' value='bar'>
			<input type='checkbox' value='baz' checked>`;

		const ractive = new Ractive({
			el: fixture,
			template: `
				<input type='checkbox' name='{{selected}}' value='foo'>
				<input type='checkbox' name='{{selected}}' value='bar'>
				<input type='checkbox' name='{{selected}}' value='baz'>`,
			enhance: true
		});

		const inputs = ractive.findAll( 'input' );
		t.ok(  inputs[0].checked );
		t.ok( !inputs[1].checked );
		t.ok(  inputs[2].checked );

		t.deepEqual( ractive.get( 'selected' ), [ 'foo', 'baz' ]);
	});

	test( 'two-way binding with radio inputs', t => {
		fixture.innerHTML = `
			<input type='radio'>
			<input type='radio' checked>
			<input type='radio'>
		`;

		const ractive = new Ractive({
			el: fixture,
			template: `
				<input type='radio' checked='{{a}}'>
				<input type='radio' checked='{{b}}'>
				<input type='radio' checked='{{c}}'>`,
			enhance: true
		});

		t.ok( !ractive.get( 'a' ) );
		t.ok(  ractive.get( 'b' ) );
		t.ok( !ractive.get( 'c' ) );
	});

	test( 'two-way binding with radio name inputs', t => {
		fixture.innerHTML = `
			<input type='radio' value='isomorphic'>
			<input type='radio' value='universal' checked>
			<input type='radio' value='who cares'>
		`;

		const ractive = new Ractive({
			el: fixture,
			template: `
				<input type='radio' name='{{selected}}' value='isomorphic'>
				<input type='radio' name='{{selected}}' value='universal'>
				<input type='radio' name='{{selected}}' value='who cares'>`,
			enhance: true
		});

		t.equal( ractive.get( 'selected' ), 'universal' );
	});

	test( 'two-way binding with contenteditable', t => {
		fixture.innerHTML = `<div contenteditable='true'><p>hello</p></div>`;

		const ractive = new Ractive({
			el: fixture,
			template: `<div contenteditable='true' value='{{value}}'></div>`,
			enhance: true
		});

		t.equal( ractive.get( 'value' ), '<p>hello</p>' );
	});

	test( 'standard namespaced attributes without namespace declaration (#2623)', t => {
		fixture.innerHTML = '<svg><use xlink:href="#foo" /></svg>';
		const svg = fixture.querySelector( 'svg' );
		const use = fixture.querySelector( 'use' );
		const r = new Ractive({
			el: fixture,
			template: '<svg><use xlink:href="#foo" /></svg>',
			enhance: true
		});

		t.strictEqual( r.find( 'svg' ), svg );
		t.strictEqual( r.find( 'use' ), use );
	});

	test( `enhancing sibling text nodes and interpolators`, t => {
		fixture.innerHTML = 'foo bar baz';
		new Ractive({
			target: fixture,
			template: 'foo {{bar}} baz',
			enhance: true,
			data: { bar: 'bar' }
		});

		t.htmlEqual( fixture.innerHTML, 'foo bar baz' );
	});

	test( `triples reuse existing content if it matches (#2403)`, t => {
		fixture.innerHTML = '<div>foo bar</div><span><i>guts</i></span>&amp; why not?<!-- yep -->?sure';
		const div = fixture.childNodes[0];
		const text = div.childNodes[0];
		const span = fixture.childNodes[1];
		const text2 = fixture.childNodes[2];
		const comment = span.childNodes[3];

		new Ractive({
			target: fixture,
			template: '{{{html}}}?{{str}}',
			data: {
				html: '<div>foo bar</div><span><i>guts</i></span>&amp; why not?<!-- yep -->',
				str: 'sure'
			},
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo bar</div><span><i>guts</i></span>&amp; why not?<!-- yep -->?sure' );

		const _div = fixture.childNodes[0];
		const _text = div.childNodes[0];
		const _span = fixture.childNodes[1];
		const _text2 = fixture.childNodes[2];
		const _comment = span.childNodes[3];

		t.ok( div === _div );
		t.ok( text === _text );
		t.ok( span === _span );
		t.ok( text2 === _text2 );
		t.ok( comment === _comment );
	});

	test( `triples that don't match existing content are still rendered correctly`, t => {
		fixture.innerHTML = '<div>nope</div>sure';

		new Ractive({
			target: fixture,
			template: '{{{html}}}',
			data: {
				html: '<div>yep</div>still yep'
			},
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, '<div>yep</div>still yep' );
	});

	test( `enhancement works with anchors`, t => {
		fixture.innerHTML = '<div>foo</div>';
		const div = fixture.childNodes[0];
		const text = div.childNodes[0];

		const foo = new Ractive({
			template: '<div>{{bar}}</div>',
			data: { bar: 'foo' }
		});

		const host = new Ractive({
			template: '<#foo />',
			enhance: true
		});

		host.attachChild( foo, { target: 'foo' } );
		host.render( fixture );

		t.ok( host.find( 'div' ) === div );
		t.ok( host.find( 'div' ).childNodes[0] === text );
	});
}
