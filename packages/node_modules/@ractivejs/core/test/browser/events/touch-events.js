import { fire } from 'simulant';
import { onWarn, initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'events/touch-events.js' );

	test( 'touch events safe to include when they don\'t exist in browser', t => {
		t.expect( 1 );

		onWarn( () => {} ); // suppress

		const ractive = new Ractive({
			el: fixture,
			template: `
				<span id="test1" on-touchstart-touchend-touchleave-touchmove-touchcancel="foo"/>
				<span id="test2" on-touchstart-mousedown="foo"/>`
		});

		ractive.on( 'foo', () => {
			t.ok( true );
		});

		fire( ractive.find( '#test2' ), 'mousedown' );
	});
}
