/*global require, describe, it */
var Ractive = require( '../../ractive' ),
	assert = require( 'assert' );

describe( 'Components', function () {
	it( 'should render in a non-DOM environment', function () {
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

		assert.equal( ractive.toHTML(), '<p>foo-baz</p>' );
	});
});