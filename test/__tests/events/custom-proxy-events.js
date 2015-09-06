test( 'custom event invoked and torndown', t => {
	expect( 3 );

	const custom = ( node, fire ) => {
		var torndown = false;

		node.addEventListener( 'click', fireEvent, false );

		function fireEvent ( event ) {

			if ( torndown ) {
				throw new Error('Custom event called after teardown');
			}

			fire({
				node: node,
				original: event
			});
		}

		return {
			teardown: function () {
				t.ok( torndown = true );
				node.removeEventListener( 'click', fireEvent, false );
			}
		}
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
