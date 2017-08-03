import { initModule } from '../helpers/test-config';
import { fire } from 'simulant';
import { test } from 'qunit';

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

		t.equal( span.className, 'foo baz yep' );
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

	test( `style attributes update hyphenated properties correctly (#2796)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style="background-color: green;" />`
		});
		const span = r.find( 'span' );

		t.equal( span.style.backgroundColor, 'green' );
	});

	test( `style attributes currectly detect the removal of a hyphenated property`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style="{{#if foo}}background-color: green;{{/if}}" />`,
			data: { foo: true }
		});
		const span = r.find( 'span' );

		t.equal( span.style.backgroundColor, 'green' );
		r.toggle( 'foo' );
		t.equal( span.style.backgroundColor, '' );
	});

	test( `inline styles can be set with important priority`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style-background-color="{{color}}" />`,
			data: { color: 'red !important' }
		});
		const span = r.find( 'span' );

		t.equal( span.style.backgroundColor, 'red' );
		t.equal( span.style.getPropertyPriority( 'background-color' ), 'important' );
		r.set( 'color', 'green !important' );
		t.equal( span.style.backgroundColor, 'green' );
		t.equal( span.style.getPropertyPriority( 'background-color' ), 'important' );
		r.set( 'color', undefined );
		t.equal( span.style.backgroundColor, '' );
		t.equal( span.style.getPropertyPriority( 'background-color' ), '' );
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

	test( `style attributes can correctly set an inline priority (#2794)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style="color: red !important" /><span style="color: green" />`,
		});

		const [ span1, span2 ] = r.findAll( 'span' );

		t.equal( span1.style.getPropertyPriority( 'color' ), 'important' );
		t.equal( span1.style.color, 'red' );
		t.equal( span2.style.getPropertyPriority( 'color' ), '' );
		t.equal( span2.style.color, 'green' );
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
			template: `<span class-foo-bar="foo" class-fooBar="bar" />`
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
		t.equal( span.className, 'bar foo baz' );
	});

	test( `class attributes don't override class directives at render (#2565)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span class-foo="true" class="bar" />`
		});

		t.equal( r.find( 'span' ).className, 'bar foo' );
	});

	test( `class directives and class attributes both contribute to toHTML (#2537)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span class-bip="true" class-nope="false" class="foo bar" class-bop="true" /><span class-foo="true" class-bar-baz="true" />`
		});

		t.equal( r.toHTML(), `<span class="foo bar bip bop"></span><span class="foo bar-baz"></span>` );
	});

	test( `style directives and style attributes both contribute to toHTML (#2537)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<span style-text-decoration="underline" style="color: green" style-fontSize="12pt" /><span style-text-decoration="underline" style-fontSize="12pt" />`
		});

		t.equal( r.toHTML(), `<span style="text-decoration: underline; color: green; font-size: 12pt;"></span><span style="text-decoration: underline; font-size: 12pt;"></span>` );
	});

	test( `nested sections in an element tag don't create phantom empty attribute nodes (#2783)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<div\n{{#if foo}}\n{{#if bar}}\ndata-foo="yep"\n{{/if}}\n{{/if}}></div>`,
			data: {
				foo: true, bar: true
			}
		});

		t.ok( r.find( 'div' ).getAttribute( 'data-foo' ) === 'yep' );
	});

	test( `class directives may be boolean`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div class-foo class-bar />`
		});

		const div = r.find( 'div' );
		t.ok( div.getAttribute( 'class' ) === 'foo bar' );
	});

	test( `bind directives create the appropriate attribute binding`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div bind-data-foo="bar" /><input bind-value="foo" />`,
			data: {
				bar: 'yep',
				foo: 'sure'
			}
		});

		const [ div, input ] = r.findAll( '*' );

		t.equal( div.getAttribute( 'data-foo' ), 'yep' );
		t.equal( input.value, 'sure' );

		input.value = 'ok';
		fire( input, 'change' );

		t.equal( r.get( 'foo' ), 'ok' );

		r.set( 'bar', 'sure' );
		t.equal( div.getAttribute( 'data-foo' ), 'sure' );
	});

	test( `bind directives as boolean use their name as the reference`, t => {
		const cmp = Ractive.extend({
			template: '<span>{{foo}}</span>'
		});
		const r = new Ractive({
			target: fixture,
			template: '<cmp bind-foo /><input bind-value />',
			data: {
				value: 'yep',
				foo: 'sure'
			},
			components: { cmp }
		});

		const [ span, input ] = r.findAll( '*' );

		t.equal( span.innerHTML, 'sure' );
		t.equal( input.value, 'yep' );
	});

	test( `class attributes try to update in original order where possible (#2903)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `<div class="{{classes.join(' ')}}" />`,
			data: {
				classes: [ 'a', 'b', 'c' ]
			}
		});

		const div = r.find( 'div' );

		r.push( 'classes', 'd', 'e' );
		t.equal( div.className, 'a b c d e' );

		r.splice( 'classes', 2, 0, 'bb' );
		t.equal( div.className, 'a b bb c d e' );

		r.set( 'classes', [] );
		t.equal( div.className, '' );

		r.set( 'classes', [ 'z', 'c', 'b' ] );
		t.equal( div.className, 'z c b' );

		r.set( 'classes', [ 'a', 'b', 'c' ] );
		t.equal( div.className, 'a b c' );
	});

	test( `class directives work with the weird classes on svg elements (#2955)`, t => {
		new Ractive({
			el: fixture,
			template: '<svg><rect x="0" y="0" width="100" height="100" class="red" class-bordered /></svg>'
		});

		t.htmlEqual( fixture.innerHTML, '<svg><rect x="0" y="0" width="100" height="100" class="red bordered" /></svg>' );
	});

	test( `style and class directives within conditional sections don't render actual attributes`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div {{#if .toggle}}style-background-color="blue" class-foo{{/if}} />`
		});

		t.htmlEqual( fixture.innerHTML, '<div></div>' );

		r.toggle( 'toggle' );

		t.htmlEqual( fixture.innerHTML, '<div style="background-color: blue;" class="foo"></div>' );
	});

	test( `style directives reset safely without undoing other same-prop directives`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div {{#if foo}}style-width="20px"{{else}}style-width="0"{{/if}} />`,
			data: { foo: false }
		});

		r.toggle( 'foo' );
		t.equal( r.find( 'div' ).style.width, '20px' );
	});
}
