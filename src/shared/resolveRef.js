import circular from 'circular';
import normaliseKeypath from 'utils/normaliseKeypath';
import hasOwnProperty from 'utils/hasOwnProperty';
import getInnerContext from 'shared/getInnerContext';

var get, ancestorErrorMessage, getOptions;

circular.push( function () {
	get = circular.get;
});

ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';

getOptions = { evaluateWrapped: true };

export default function resolveRef ( ractive, ref, fragment ) {
	var context, key, parentValue, hasContextChain;

	ref = normaliseKeypath( ref );

	// If a reference begins with '.', it's either a restricted reference or
	// an ancestor reference...
	if ( ref.charAt( 0 ) === '.' ) {
		return resolveAncestorReference( getInnerContext( fragment ), ref );
	}

	// ...otherwise we need to find the keypath
	key = ref.split( '.' )[0];

	do {
		context = fragment.context;

		if ( !context ) {
			continue;
		}

		hasContextChain = true;
		parentValue = get( ractive, context, getOptions );

		if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && key in parentValue ) {
			return context + '.' + ref;
		}
	} while ( fragment = fragment.parent );


	// Still no keypath?

	// If there's no context chain, and the instance is either a) isolated or
	// b) an orphan, then we know that the keypath is identical to the reference
	if ( !hasContextChain && ( !ractive._parent || ractive.isolated ) ) {
		return ref;
	}

	// We need both of these - the first enables components to treat data contexts
	// like lexical scopes in JavaScript functions...
	if ( hasOwnProperty.call( ractive.data, key ) ) {
		return ref;
	}

	// while the second deals with references like `foo.bar`
	else if ( get( ractive, ref ) !== undefined ) {
		return ref;
	}
}

function resolveAncestorReference ( baseContext, ref ) {
	var contextKeys;

	// {{.}} means 'current context'
	if ( ref === '.' ) return baseContext;

	contextKeys = baseContext ? baseContext.split( '.' ) : [];

	// ancestor references (starting "../") go up the tree
	if ( ref.substr( 0, 3 ) === '../' ) {
		while ( ref.substr( 0, 3 ) === '../' ) {
			if ( !contextKeys.length ) {
				throw new Error( ancestorErrorMessage );
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
