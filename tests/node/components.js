export default function(){

	QUnit.module( 'Components' );

	QUnit.test( 'should render in a non-DOM environment', t => {
		const Widget = Ractive.extend({
			template: '<p>foo-{{bar}}</p>'
		});

		const ractive = new Ractive({
			template: '<widget/>',
			data: {
				bar: 'baz'
			},
			components: {
				widget: Widget
			}
		});

		t.equal( ractive.toHTML(), '<p>foo-baz</p>' );
	});

	QUnit.test( 'should not fail if component has CSS', t => {
		const Widget = Ractive.extend({
			template: '<p>red</p>',
			css: 'p { color: red; }'
		});

		new Widget();

		// If the code reached this point, then the lines before it didn't blow up.
		t.ok(true);
	});

}
