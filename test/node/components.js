var Ractive = require( '../../tmp/ractive' );

exports[ 'A template can include templates in a non-DOM environment' ] = function ( t ) {
	var ractive, Widget;

	Widget = Ractive.extend({
		template: '<p>foo-{{bar}}</p>'
	});

	ractive = new Ractive({
		template: '<widget/>',
		data: {
			bar: 'baz'
		},
		components: {
			widget: Widget
		}
	});

	t.equal( ractive.toHTML(), '<p>foo-baz</p>' )

	t.done();
};
