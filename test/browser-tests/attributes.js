import { test } from 'qunit';

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
