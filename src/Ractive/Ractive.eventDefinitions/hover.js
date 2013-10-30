(function () {

	var testDiv = document.createElement( 'div' );

	// If we're in IE, we can use native mouseenter/mouseleave events
	if ( testDiv.onmouseenter !== undefined ) {
		eventDefinitions.hover = function ( node, fire ) {
			var mouseenterHandler, mouseleaveHandler;

			mouseenterHandler = function ( event ) {
				fire({
					node: node,
					original: event,
					hover: true
				});
			};

			mouseleaveHandler = function ( event ) {
				fire({
					node: node,
					original: event,
					hover: false
				});
			};

			node.addEventListener( 'mouseenter', mouseenterHandler, false );
			node.addEventListener( 'mouseleave', mouseleaveHandler, false );

			return {
				teardown: function () {
					node.removeEventListener( 'mouseenter', mouseenterHandler, false );
					node.removeEventListener( 'mouseleave', mouseleaveHandler, false );
				}
			};
		};
	}

	else {
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
	}


}());

