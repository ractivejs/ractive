export default function Transition$start ( isIntro ) {
	var t = this, node = t.element.node;

	// store original style attribute
	t.originalStyle = node.getAttribute( 'style' );

	// create t.complete() - we don't want this on the prototype,
	// because we don't want `this` silliness when passing it as
	// an argument
	t.complete = function ( noReset ) {
		if ( !noReset && t.isIntro ) {
			t.resetStyle();
		}

		node._ractive.transition = null;
		t._manager.remove( t );
	};

	t._fn.apply( t.root, [ t ].concat( t.params ) );
}
