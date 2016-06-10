import { test } from 'qunit';
import { initModule } from './test-config';

export default function () {
	initModule( 'attributes.js' );

	test( `class attributes only update the classes in their content`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span class="{{classes}}" />`,
			data: { classes: 'foo bar' }
		});
		const span = r.find( 'span' );

		span.className += ' yep';
		r.set( 'classes', 'foo baz' );

		t.equal( span.className, 'foo yep baz' );
	});

	test( `style attributes only update the styles in their content`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style="{{styles}}" />`,
			data: { styles: 'width: 100px; height: 99px' }
		});
		const span = r.find( 'span' );

		span.style.display = 'block';
		r.set( 'styles', 'color: red; height: 87.5%;' );

		t.equal( span.style.display, 'block' );
		t.equal( span.style.color, 'red' );
		t.equal( span.style.height, '87.5%' );
	});

	test( `style attributes don't try to use a boolean value (#2522)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style="{{#if foo}}{{else}}color: red{{/if}}" />`,
			data: { foo: false }
		});
		const span = r.find( 'span' );

		t.equal( span.style.color, 'red' );
		r.set( 'foo', true );
		t.equal( span.style.color, '' );
	});

	test( `style attributes can be inline directives`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style-color="{{color}}" />`,
			data: { color: 'red' }
		});
		const span = r.find( 'span' );

		t.equal( span.style.color, 'red' );
		r.set( 'color', 'green' );
		t.equal( span.style.color, 'green' );
	});

	test( `class attributes can be inline directives`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span class-foo-bar="{{foo}}" class-fooBar="{{bar}}" />`
		});
		const span = r.find( 'span' );

		t.equal( span.className, '' );
		r.toggle( 'foo' );
		t.equal( span.className, 'foo-bar' );
		r.toggle( 'bar' );
		t.equal( span.className, 'foo-bar fooBar' );
		r.toggle( 'foo' );
		t.equal( span.className, 'fooBar' );
		r.toggle( 'bar' );
		t.equal( span.className, '' );
	});

	test( `class attributes don't try to remove missing attributes (#2510)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span class="bar{{#if foo}} foo{{/if}}" />`,
			data: { foo: true }
		});
		const span = r.find( 'span' );

		t.equal( span.className, 'bar foo' );
		span.className = 'bar baz';
		r.toggle( 'foo' );
		t.equal( span.className, 'bar baz' );
		r.toggle( 'foo' );
		t.equal( span.className, 'bar baz foo' );
	});

	test( `class attributes don't override class directives at render (#2565)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span class-foo="{{true}}" class="bar" />`
		});

		t.equal( r.find( 'span' ).className, 'foo bar' );
	});

	test( `class directives and class attributes both contribute to toHTML (#2537)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span class-bip="{{true}}" class-nope="{{false}}" class="foo bar" class-bop="{{true}}" /><span class-foo="{{true}}" class-bar-baz="{{true}}" />`
		});

		t.equal( r.toHTML(), `<span class="bip foo bar bop"></span><span class="foo bar-baz"></span>` );
	});

	test( `style directives and style attributes both contribute to toHTML (#2537)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style-text-decoration="underline" style="color: green" style-fontSize="12pt" /><span style-text-decoration="underline" style-fontSize="12pt" />`
		});

		t.equal( r.toHTML(), `<span style="text-decoration: underline; color: green; font-size: 12pt;"></span><span style="text-decoration: underline; font-size: 12pt;"></span>` );
	});

	test( 'attribute namespaces declared next to the attribute should render (#2560)', t => {
		new Ractive({
			el: fixture,
			template: '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://foo.com/bar#baz" /></svg>'
		});

		t.htmlEqual( fixture.innerHTML, '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://foo.com/bar#baz"></use></svg>' );
	});
}
