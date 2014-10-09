var Ractive = require( '../../ractive' );

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

exports[ 'Component in node - gh #573' ] = function ( t ) {
	var Tooltip = Ractive.extend({
		template: '<div class="tooltip"><span class="fa fa-help"></span><div class="tooltip-message">{{message}}</div></div>',
		data: {
		    message: 'No message specified, using the default'
		}
	});

	var ractive = new Ractive({
		template: '<tooltip message="{{description}}"/>',
		components: {
			tooltip: Tooltip
		}
	});

	t.ok( ractive.toHTML() )

	t.done();
};


