eventDefinitions.hover = function ( node, fire ) {
	var mouseoverHandler, mouseoutHandler;

	mouseoverHandler = function ( event ) {
		if ( node.contains( event.relatedTarget ) ) {
			return;
		}

		fire({
			node: node,
			original: event,
			hover: true
		});
	};

	mouseoutHandler = function ( event ) {
		if ( node.contains( event.relatedTarget ) ) {
			return;
		}
		
		fire({
			node: node,
			original: event,
			hover: false
		});
	};

	node.addEventListener( 'mouseover', mouseoverHandler, false );
	node.addEventListener( 'mouseout', mouseoutHandler, false );

	return {
		teardown: function () {
			node.removeEventListener( 'mouseover', mouseoverHandler, false );
			node.removeEventListener( 'mouseout', mouseoutHandler, false );
		}
	};
};