QUnit.module( 'Components' );

QUnit.test( 'should render in a non-DOM environment', function ( assert ) {
	var Widget = Ractive.extend({
		template: '<p>foo-{{bar}}</p>'
	});

	var ractive = new Ractive({
		template: '<widget/>',
		data: {
			bar: 'baz'
		},
		components: {
			widget: Widget
		}
	});

	assert.equal( ractive.toHTML(), '<p>foo-baz</p>' );
});

QUnit.test( 'should not fail if component has CSS', function ( assert ) {
	var Widget = Ractive.extend({
		template: '<p>red</p>',
		css: 'p { color: red; }'
	});

	new Widget();

	// If the code reached this point, then the lines before it didn't blow up.
	assert.ok(true);
});
