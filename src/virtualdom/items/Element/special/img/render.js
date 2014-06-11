export default function renderImage ( img ) {
	var width, height, loadHandler;

	// if this is an <img>, and we're in a crap browser, we may need to prevent it
	// from overriding width and height when it loads the src
	if ( ( width = img.getAttribute( 'width' ) ) || ( height = img.getAttribute( 'height' ) ) ) {
		img.node.addEventListener( 'load', loadHandler = function () {
			if ( width ) {
				img.node.width = width.value;
			}

			if ( height ) {
				img.node.height = height.value;
			}

			img.node.removeEventListener( 'load', loadHandler, false );
		}, false );
	}
}
