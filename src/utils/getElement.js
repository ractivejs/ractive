export default function getElement( input ) {
	var output;

	if ( !input || typeof input === 'boolean' ) { return; }

	if ( typeof window === 'undefined' || !document || !input ) {
		return null;
	}

	// We already have a DOM node - no work to do. (Duck typing alert!)
	if ( input.nodeType ) {
		return input;
	}

	// Get node from string
	if ( typeof input === 'string' ) {
		// try ID first
		output = document.getElementById( input );

		// then as selector, if possible
		if ( !output && document.querySelector ) {
			output = document.querySelector( input );
		}

		// did it work?
		if ( output && output.nodeType ) {
			return output;
		}
	}

	// If we've been given a collection (jQuery, Zepto etc), extract the first item
	if ( input[0] && input[0].nodeType ) {
		return input[0];
	}

	return null;
}
