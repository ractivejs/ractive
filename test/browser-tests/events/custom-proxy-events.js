import { test } from 'qunit';
import { fire } from 'simulant';
import { initModule } from '../test-config';

export default function() {
	initModule( 'events/custom-proxy-events.js' );

	test( 'custom event invoked and torndown', t => {
		t.expect( 3 );

		const custom = ( node, fire ) => {
			let torndown = false;

			node.addEventListener( 'click', fireEvent, false );

			function fireEvent ( event ) {
				if ( torndown ) {
					throw new Error('Custom event called after teardown');
				}

				fire({ node, original: event });
			}

			return {
				teardown () {
					t.ok( torndown = true );
					node.removeEventListener( 'click', fireEvent, false );
				}
			};
		};

		const ractive = new Ractive({
			el: fixture,
			events: { custom },
			template: '<span id="test" on-custom="someEvent">click me</span>'
		});

		ractive.on( 'someEvent', function () {
			t.ok( true );
			t.equal( this.event.type, 'click' );
		});

		const span = ractive.find( 'span' );

		fire( span, 'click' );
		ractive.unrender();
		fire( span, 'click' );
	});
}
