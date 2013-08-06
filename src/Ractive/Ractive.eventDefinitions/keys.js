(function () {

	var makeKeyDefinition = function ( code ) {
		return function ( node, fire ) {
			var keydownHandler;

			node.addEventListener( 'keydown', keydownHandler = function ( event ) {
				var which = event.which || event.keyCode;

				if ( which === code ) {
					event.preventDefault();

					fire({
						node: node,
						original: event
					});
				}
			}, false );

			return {
				teardown: function () {
					node.removeEventListener( 'keydown', keydownHandler, false );
				}
			};
		};
	};

	eventDefinitions.enter = makeKeyDefinition( 13 );
	eventDefinitions.tab = makeKeyDefinition( 9 );
	eventDefinitions.escape = makeKeyDefinition( 27 );
	eventDefinitions.space = makeKeyDefinition( 32 );

}());