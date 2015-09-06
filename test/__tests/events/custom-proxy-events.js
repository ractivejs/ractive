import { test } from 'qunit';

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

	ractive.on( 'someEvent', function ( event ) {
		t.ok( true );
		t.equal( event.original.type, 'click' );
	});

	const span = ractive.find( 'span' );

	simulant.fire( span, 'click' );
	ractive.unrender();
	simulant.fire( span, 'click' );
});
