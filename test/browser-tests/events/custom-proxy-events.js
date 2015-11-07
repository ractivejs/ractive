import { test } from 'qunit';
import { fire } from 'simulant';
import { hasUsableConsole, onWarn } from 'test-config';

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

	fire( span, 'click' );
	ractive.unrender();
	fire( span, 'click' );
});

if ( hasUsableConsole ) {
	test( 'Missing event plugin', t => {
		t.expect( 1 );

	    onWarn( msg => {
	      t.ok( /Missing "foo" events plugin/.test( msg ) );
	    });

		new Ractive({
			el: fixture,
			template: '<div on-foo="">missing</div>',
		});
	});
}
