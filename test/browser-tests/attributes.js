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
}
