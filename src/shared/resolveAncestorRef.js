export default function resolveAncestorRef ( baseContext, ref ) {
	var contextKeys;

	// {{.}} means 'current context'
	if ( ref === '.' ) return baseContext;

	contextKeys = baseContext ? baseContext.split( '.' ) : [];

	// ancestor references (starting "../") go up the tree
	if ( ref.substr( 0, 3 ) === '../' ) {
		while ( ref.substr( 0, 3 ) === '../' ) {
			if ( !contextKeys.length ) {
				throw new Error( 'Could not resolve reference - too many "../" prefixes' );
			}

			contextKeys.pop();
			ref = ref.substring( 3 );
		}

		contextKeys.push( ref );
		return contextKeys.join( '.' );
	}

	// not an ancestor reference - must be a restricted reference (prepended with "." or "./")
	if ( !baseContext ) {
		return ref.replace( /^\.\/?/, '' );
	}

	return baseContext + ref.replace( /^\.\//, '.' );
}