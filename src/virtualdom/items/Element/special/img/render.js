export default function renderImage ( img ) {
	var loadHandler;

	// if this is an <img>, and we're in a crap browser, we may need to prevent it
	// from overriding width and height when it loads the src
	if ( img.attributes.width || img.attributes.height ) {
		img.node.addEventListener( 'load', loadHandler = function () {
			var width = img.getAttribute( 'width' ),
				height = img.getAttribute( 'height' );

			if ( width !== undefined ) {
				img.node.setAttribute('width', width);
			}

			if ( height !== undefined ) {
				img.node.setAttribute('height', height);
			}

			img.node.removeEventListener( 'load', loadHandler, false );
		}, false );
	}
}
