import { test } from 'qunit';
import { fire } from 'simulant';

test( 'touch events safe to include when they don\'t exist in browser', t => {
	t.expect( 1 );

	const ractive = new Ractive({
		el: fixture,
		template: `
			<span id="test1" on-touchstart-touchend-touchleave-touchmove-touchcancel="foo"/>
			<span id="test2" on-touchstart-mousedown="foo"/>`
	});

	ractive.on( 'foo', function () {
		t.ok( true );
	});

	fire( ractive.nodes.test2, 'mousedown' );
});
