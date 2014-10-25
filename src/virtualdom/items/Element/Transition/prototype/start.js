export default function Transition$start () {
	var node, originalStyle, completed;

	node = this.node = this.element.node;
	originalStyle = node.getAttribute( 'style' );

	// create t.complete() - we don't want this on the prototype,
	// because we don't want `this` silliness when passing it as
	// an argument
	this.complete = noReset => {
		if ( completed ) {
			return;
		}

		if ( !noReset && this.isIntro ) {
			resetStyle( node, originalStyle);
		}

		node._ractive.transition = null;
		this._manager.remove( this );

		completed = true;
	};

	// If the transition function doesn't exist, abort
	if ( !this._fn ) {
		this.complete();
		return;
	}

	this._fn.apply( this.root, [ this ].concat( this.params ) );
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
