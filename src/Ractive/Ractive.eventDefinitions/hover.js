eventDefinitions.hover = function ( node, fire ) {
	var mouseoverHandler, mouseoutHandler;

	mouseoverHandler = function ( event ) {
		fire({
			node: node,
			original: event,
			hover: true
		});
	};

	mouseoutHandler = function ( event ) {
		fire({
			node: node,
			original: event,
			hover: false
		});
	};

	node.addEventListener( 'mouseover', mouseoverHandler );
	node.addEventListener( 'mouseout', mouseoutHandler );

	return {
		teardown: function () {
			node.removeEventListener( 'mouseover', mouseoverHandler );
			node.removeEventListener( 'mouseout', mouseoutHandler );
		}
	};
};