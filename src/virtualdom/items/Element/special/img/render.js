export default function renderImage ( img ) {
	var width, height, loadHandler;

	// if this is an <img>, and we're in a crap browser, we may need to prevent it
	// from overriding width and height when it loads the src
	if ( ( width = this.getAttribute( 'width' ) ) || ( height = this.getAttribute( 'height' ) ) ) {
		this.node.addEventListener( 'load', loadHandler = function () {
			if ( width ) {
				this.node.width = width.value;
			}

			if ( height ) {
				this.node.height = height.value;
			}

			this.node.removeEventListener( 'load', loadHandler, false );
		}, false );
	}
}
