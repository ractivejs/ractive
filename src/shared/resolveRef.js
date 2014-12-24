import { getKeypath, normalise } from 'shared/keypaths';
import getInnerContext from 'shared/getInnerContext';

export default function resolveRef ( ractive, ref, fragment ) {
	var keypath;

	ref = normalise( ref );

	// If a reference begins '~/', it's a top-level reference
	if ( ref.substr( 0, 2 ) === '~/' ) {
		keypath = getKeypath( ref.substring( 2 ) );
		createMappingIfNecessary( ractive, keypath.firstKey, fragment );
	}

	// If a reference begins with '.', it's either a restricted reference or
	// an ancestor reference...
	else if ( ref[0] === '.' ) {
		keypath = resolveAncestorRef( getInnerContext( fragment ), ref );

		if ( keypath ) {
			createMappingIfNecessary( ractive, keypath.firstKey, fragment );
		}
	}

	// ...otherwise we need to figure out the keypath based on context
	else {
		keypath = resolveAmbiguousReference( ractive, getKeypath( ref ), fragment );
	}

	return keypath;
}

function resolveAncestorRef ( baseContext, ref ) {
	var contextKeys;

	// TODO...
	if ( baseContext != undefined && typeof baseContext !== 'string' ) {
		baseContext = baseContext.str;
	}

	// {{.}} means 'current context'
	if ( ref === '.' ) return getKeypath( baseContext );

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
		return getKeypath( contextKeys.join( '.' ) );
	}

	// not an ancestor reference - must be a restricted reference (prepended with "." or "./")
	if ( !baseContext ) {
		return getKeypath( ref.replace( /^\.\/?/, '' ) );
	}

	return getKeypath( baseContext + ref.replace( /^\.\//, '.' ) );
}

function resolveAmbiguousReference ( ractive, ref, fragment, isParentLookup ) {
	var context,
		key,
		parentValue,
		hasContextChain,
		parentKeypath;

	if ( ref.isRoot ) {
		return ref;
	}

	key = ref.firstKey;

	while ( fragment ) {
		context = fragment.context;
		fragment = fragment.parent;

		if ( !context ) {
			continue;
		}

		hasContextChain = true;
		parentValue = ractive.viewmodel.get( context );

		if ( parentValue && ( typeof parentValue === 'object' || typeof parentValue === 'function' ) && key in parentValue ) {
			return context.join( ref.str );
		}
	}

	// Root/computed/mapped property?
	if ( isRootProperty( ractive, key ) ) {
		return ref;
	}

	// If this is an inline component, and it's not isolated, we
	// can try going up the scope chain
	if ( ractive.parent && !ractive.isolated ) {
		hasContextChain = true;
		fragment = ractive.component.parentFragment;

		key = getKeypath( key );

		if ( parentKeypath = resolveAmbiguousReference( ractive.parent, key, fragment, true ) ) {
			// We need to create an inter-component binding
			ractive.viewmodel.map( key, {
				origin: ractive.parent.viewmodel,
				keypath: parentKeypath
			});

			return ref;
		}
	}

	// If there's no context chain, and the instance is either a) isolated or
	// b) an orphan, then we know that the keypath is identical to the reference
	if ( !isParentLookup && !hasContextChain ) {
		// the data object needs to have a property by this name,
		// to prevent future failed lookups
		ractive.viewmodel.set( ref, undefined );
		return ref;
	}
}

function createMappingIfNecessary ( ractive, key ) {
	var parentKeypath;

	if ( !ractive.parent || ractive.isolated || isRootProperty( ractive, key ) ) {
		return;
	}

	key = getKeypath( key );

	if ( parentKeypath = resolveAmbiguousReference( ractive.parent, key, ractive.component.parentFragment, true ) ) {
		ractive.viewmodel.map( key, {
			origin: ractive.parent.viewmodel,
			keypath: parentKeypath
		});
	}
}

function isRootProperty ( ractive, key ) {
	// special case for reference to root
	return key === '' || key in ractive.data || key in ractive.viewmodel.computations || key in ractive.viewmodel.mappings;
}
