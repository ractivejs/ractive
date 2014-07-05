export default function Transition$start () {
	var t = this, node, originalStyle;

	node = t.node = t.element.node;
	originalStyle = node.getAttribute( 'style' );

	// create t.complete() - we don't want this on the prototype,
	// because we don't want `this` silliness when passing it as
	// an argument
	t.complete = function ( noReset ) {
		if ( !noReset && t.isIntro ) {
			resetStyle( node, originalStyle);
		}

		node._ractive.transition = null;
		t._manager.remove( t );
	};

	// If the transition function doesn't exist, abort
	if ( !t._fn ) {
		t.complete();
		return;
	}

	t._fn.apply( t.root, [ t ].concat( t.params ) );
}

function resetStyle ( node, style ) {
	if ( style ) {
		node.setAttribute( 'style', style );
	} else {

		// Next line is necessary, to remove empty style attribute!
		// See http://stackoverflow.com/a/7167553
		node.getAttribute( 'style' );
		node.removeAttribute( 'style' );
	}
}
